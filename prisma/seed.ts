import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.notification?.deleteMany().catch(() => {});
  await prisma.message.deleteMany();
  await prisma.file.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Don't create any users or companies — let users create their own
  console.log('Database cleaned. Create your company through the app!');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
