import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required'),
  companyId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'ACCEPTED', 'IN_PROGRESS', 'READY', 'DONE', 'BLOCKED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'ACCEPTED', 'IN_PROGRESS', 'READY', 'DONE', 'BLOCKED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

export const createMessageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  content: z.string().min(1, 'Message content is required'),
});

export const createSalarySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  bonus: z.number().min(0, 'Bonus must be non-negative').optional(),
  deductions: z.number().min(0, 'Deductions must be non-negative').optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  salary: z.number().positive().optional(),
  role: z.enum(['CEO', 'MANAGER', 'DEVELOPER', 'DESIGNER', 'MARKETER', 'HR', 'SALES', 'INTERN', 'ACCOUNTANT', 'SUPPORT']).optional(),
  email: z.string().email().optional(),
  salaryDueDate: z.string().optional(),
  startDate: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['CEO', 'MANAGER', 'DEVELOPER', 'DESIGNER', 'MARKETER', 'HR', 'SALES', 'INTERN', 'ACCOUNTANT', 'SUPPORT']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  salary: z.number().positive().optional(),
  salaryDueDate: z.string().optional(),
  startDate: z.string().optional(),
});

export const createJoinRequestSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  message: z.string().optional(),
});

export const reviewJoinRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  role: z.enum(['CEO', 'MANAGER', 'DEVELOPER', 'DESIGNER', 'MARKETER', 'HR', 'SALES', 'INTERN', 'ACCOUNTANT', 'SUPPORT']).optional(),
});

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0];
  return { success: false, error: firstError.message };
}
