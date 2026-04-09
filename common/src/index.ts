// Shared types between client and server

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  boardId: string;
  issues: Issue[];
}

export interface Issue {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  order: number;
  columnId: string;
  assigneeId?: string;
  assignee?: User;
  dueDate?: string;
  labels: Label[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  issueId: string;
}

export interface Comment {
  id: string;
  content: string;
  issueId: string;
  authorId: string;
  author: User;
  createdAt: string;
}

// API Request/Response types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface BoardWithDetails extends Board {
  columns: Column[];
  members: BoardMember[];
}

export interface BoardMember {
  id: string;
  role: Role;
  user: User;
  userId: string;
  boardId: string;
}

// WebSocket event types
export type WSEventType =
  | 'board-updated'
  | 'issue-created'
  | 'issue-updated'
  | 'issue-moved'
  | 'column-created'
  | 'column-updated'
  | 'column-deleted'
  | 'user-joined'
  | 'user-left'
  | 'presence-update';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: string;
}

// API Error
export interface APIError {
  error: string;
  message: string;
  statusCode: number;
}
