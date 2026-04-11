// Shared types for NovaBoard

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type Role = 'ADMIN' | 'MEMBER' | 'VIEWER'

export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}

export interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface WorkspaceMember {
  id: string
  role: Role
  userId: string
  workspaceId: string
  user: User
}

export interface Project {
  id: string
  name: string
  key: string
  description: string | null
  workspaceId: string
}

export interface Column {
  id: string
  name: string
  order: number
  color: string | null
  projectId: string
  issues?: Issue[]
}

export interface Issue {
  id: string
  issueNumber: number
  title: string
  description: string | null
  order: number
  priority: Priority
  columnId: string
  projectId: string
  parentId: string | null
  reporterId: string
  assigneeId: string | null
  reporter: User
  assignee: User | null
  labels: IssueLabel[]
  subIssues: Issue[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Label {
  id: string
  name: string
  color: string
}

export interface WorkspaceLabel extends Label {
  workspaceId: string
}

export interface ProjectLabel extends Label {
  projectId: string
}

export interface IssueLabel {
  issueId: string
  workspaceLabelId: string | null
  projectLabelId: string | null
  workspaceLabel: WorkspaceLabel | null
  projectLabel: ProjectLabel | null
}

export interface Comment {
  id: string
  content: string
  issueId: string
  userId: string
  user: User
  createdAt: string
  updatedAt: string
}
