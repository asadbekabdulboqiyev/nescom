import {
  registerSchema,
  loginSchema,
  createTaskSchema,
  createMessageSchema,
  createSalarySchema,
  createUserSchema,
  validateRequest,
} from '../validation';

describe('registerSchema', () => {
  it('should accept valid data', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123',
      name: 'John Doe',
    });
    if (!result.success) {
      console.log('REGISTER SCHEMA ERROR:', JSON.stringify(result.error.issues));
    }
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'invalid-email',
      password: 'Password123',
      name: 'John Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short password', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'short',
      name: 'John Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password without uppercase', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      name: 'John Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password without lowercase', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'PASSWORD123',
      name: 'John Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password without number', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'PasswordOnly',
      name: 'John Doe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123',
      name: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('should accept valid data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('createTaskSchema', () => {
  it('should accept valid data with only title', () => {
    const result = createTaskSchema.safeParse({
      title: 'New task',
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid data with all fields', () => {
    const result = createTaskSchema.safeParse({
      title: 'New task',
      description: 'Task description',
      status: 'TODO',
      priority: 'HIGH',
      assigneeId: 'user-123',
      dueDate: '2024-12-31',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const result = createTaskSchema.safeParse({
      title: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid status', () => {
    const result = createTaskSchema.safeParse({
      title: 'Task',
      status: 'INVALID_STATUS',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid priority', () => {
    const result = createTaskSchema.safeParse({
      title: 'Task',
      priority: 'CRITICAL',
    });
    expect(result.success).toBe(false);
  });
});

describe('createMessageSchema', () => {
  it('should accept valid data', () => {
    const result = createMessageSchema.safeParse({
      receiverId: 'user-123',
      content: 'Hello!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty receiverId', () => {
    const result = createMessageSchema.safeParse({
      receiverId: '',
      content: 'Hello!',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty content', () => {
    const result = createMessageSchema.safeParse({
      receiverId: 'user-123',
      content: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('createSalarySchema', () => {
  it('should accept valid data', () => {
    const result = createSalarySchema.safeParse({
      userId: 'user-123',
      amount: 5000,
      dueDate: '2024-12-31',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty userId', () => {
    const result = createSalarySchema.safeParse({
      userId: '',
      amount: 5000,
      dueDate: '2024-12-31',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative amount', () => {
    const result = createSalarySchema.safeParse({
      userId: 'user-123',
      amount: -5000,
      dueDate: '2024-12-31',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty dueDate', () => {
    const result = createSalarySchema.safeParse({
      userId: 'user-123',
      amount: 5000,
      dueDate: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('createUserSchema', () => {
  it('should accept valid data', () => {
    const result = createUserSchema.safeParse({
      email: 'test@example.com',
      name: 'John Doe',
      role: 'DEVELOPER',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = createUserSchema.safeParse({
      email: 'invalid',
      name: 'John Doe',
      role: 'DEVELOPER',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid role', () => {
    const result = createUserSchema.safeParse({
      email: 'test@example.com',
      name: 'John Doe',
      role: 'INVALID_ROLE',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short password', () => {
    const result = createUserSchema.safeParse({
      email: 'test@example.com',
      name: 'John Doe',
      role: 'DEVELOPER',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });
});

describe('validateRequest', () => {
  it('should return success for valid data', () => {
    const result = validateRequest(loginSchema, {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
    }
  });

  it('should return error for invalid data', () => {
    const result = validateRequest(loginSchema, {
      email: 'invalid',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});
