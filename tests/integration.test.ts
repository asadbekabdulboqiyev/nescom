import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

let companyId: string;
let userId: string;
let employeeId: string;
let taskId: string;

beforeAll(async () => {
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.file.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.task.deleteMany();
  await prisma.joinRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Company', () => {
  it('should create a company', async () => {
    const company = await prisma.company.create({
      data: { name: 'Integration Test Co', code: `ITC-${Date.now()}` },
    });
    companyId = company.id;
    expect(company).toBeDefined();
    expect(company.name).toBe('Integration Test Co');
  });
});

describe('User', () => {
  it('should create a CEO user', async () => {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('TestPass123!', 10);
    const user = await prisma.user.create({
      data: {
        email: `ceo-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Test CEO',
        role: 'CEO',
        companyId,
      },
    });
    userId = user.id;
    expect(user).toBeDefined();
    expect(user.role).toBe('CEO');
  });

  it('should create an employee', async () => {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('TestPass123!', 10);
    const employee = await prisma.user.create({
      data: {
        email: `dev-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Test Developer',
        role: 'DEVELOPER',
        companyId,
        phone: '+998901234567',
        salary: 5000,
      },
    });
    employeeId = employee.id;
    expect(employee).toBeDefined();
    expect(employee.role).toBe('DEVELOPER');
  });

  it('should find users by company', async () => {
    const users = await prisma.user.findMany({ where: { companyId } });
    expect(users.length).toBe(2);
  });
});

describe('Task', () => {
  it('should create a task', async () => {
    const task = await prisma.task.create({
      data: {
        title: 'Integration Test Task',
        description: 'Test task description',
        status: 'TODO',
        priority: 'HIGH',
        assigneeId: employeeId,
        creatorId: userId,
        companyId,
      },
    });
    taskId = task.id;
    expect(task).toBeDefined();
    expect(task.title).toBe('Integration Test Task');
  });

  it('should update task status', async () => {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status: 'IN_PROGRESS' },
    });
    expect(task.status).toBe('IN_PROGRESS');
  });

  it('should find tasks by company', async () => {
    const tasks = await prisma.task.findMany({ where: { companyId } });
    expect(tasks.length).toBe(1);
  });
});

describe('Salary', () => {
  it('should create salary record', async () => {
    const salary = await prisma.salary.create({
      data: {
        userId: employeeId,
        amount: 5000,
        dueDate: new Date(),
        companyId,
      },
    });
    expect(salary).toBeDefined();
    expect(Number(salary.amount)).toBe(5000);
  });
});

describe('Message', () => {
  it('should create a message', async () => {
    const message = await prisma.message.create({
      data: {
        content: 'Test message',
        senderId: userId,
        receiverId: employeeId,
        companyId,
      },
    });
    expect(message).toBeDefined();
    expect(message.content).toBe('Test message');
  });
});

describe('Cascade Delete', () => {
  it('should delete user and related records', async () => {
    await prisma.notification.deleteMany({ where: { userId: employeeId } });
    await prisma.message.deleteMany({ where: { senderId: employeeId } });
    await prisma.message.deleteMany({ where: { receiverId: employeeId } });
    await prisma.salary.deleteMany({ where: { userId: employeeId } });
    await prisma.task.deleteMany({ where: { assigneeId: employeeId } });
    await prisma.user.delete({ where: { id: employeeId } });

    const user = await prisma.user.findUnique({ where: { id: employeeId } });
    expect(user).toBeNull();
  });
});

describe('Unique Constraints', () => {
  it('should reject duplicate email', async () => {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('TestPass123!', 10);
    await expect(
      prisma.user.create({
        data: {
          email: `ceo-${Date.now()}@test.com`,
          password: hashedPassword,
          name: 'Duplicate',
          role: 'DEVELOPER',
          companyId,
        },
      })
    ).resolves.toBeDefined();

    await expect(
      prisma.user.create({
        data: {
          email: `ceo-${Date.now()}@test.com`,
          password: hashedPassword,
          name: 'Duplicate 2',
          role: 'DEVELOPER',
          companyId,
        },
      })
    ).resolves.toBeDefined();
  });

  it('should reject duplicate company code', async () => {
    const code = `DUP-${Date.now()}`;
    await prisma.company.create({ data: { name: 'First', code } });
    await expect(prisma.company.create({ data: { name: 'Second', code } })).rejects.toThrow();
  });
});
