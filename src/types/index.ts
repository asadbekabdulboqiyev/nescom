export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  phone?: string | null;
  salary?: number | null;
  companyId: string;
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
  assignee?: { id: string; name: string; avatar?: string | null };
  creator?: { id: string; name: string; avatar?: string | null };
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string | null };
  receiver: { id: string; name: string; avatar?: string | null };
}

export interface Salary {
  id: string;
  userId: string;
  amount: number;
  status: string;
  dueDate: string;
  user?: { id: string; name: string; avatar?: string | null };
}

export interface Company {
  id: string;
  name: string;
  code: string;
  industry?: string | null;
  description?: string | null;
}
