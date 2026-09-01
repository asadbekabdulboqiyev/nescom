export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginatedMeta;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  phone?: string | null;
  salary?: number | null;
  salaryDueDate?: string | null;
  startDate?: string | null;
  companyId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  assigneeId?: string | null;
  creatorId: string;
  companyId: string;
  createdAt: string;
  dueDate?: string | null;
  tags?: string[];
  assignee?: { id: string; name: string; avatar?: string | null };
  creator?: { id: string; name: string; avatar?: string | null };
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  companyId: string;
  createdAt: string;
  read: boolean;
  readAt?: string | null;
  sender: { id: string; name: string; avatar?: string | null };
  receiver: { id: string; name: string; avatar?: string | null };
}

export interface Salary {
  id: string;
  userId: string;
  amount: number;
  bonus: number;
  deductions: number;
  status: string;
  dueDate: string;
  paidAt?: string | null;
  companyId: string;
  user?: { id: string; name: string; avatar?: string | null };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  companyId: string;
  createdAt: string;
  link?: string | null;
}

export interface JoinRequest {
  id: string;
  userId: string;
  companyId: string;
  status: string;
  message?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  reviewer?: { id: string; name: string } | null;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  industry?: string | null;
  description?: string | null;
  logo?: string | null;
  createdAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'TODO' | 'ACCEPTED' | 'IN_PROGRESS' | 'READY' | 'DONE' | 'BLOCKED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: string;
  dueDate?: string;
}

export interface CreateMessageRequest {
  receiverId: string;
  content: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: string;
  password: string;
  phone?: string;
  salary?: number;
  salaryDueDate?: string;
  startDate?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  salary?: number;
  avatar?: string;
  salaryDueDate?: string;
  startDate?: string;
}
