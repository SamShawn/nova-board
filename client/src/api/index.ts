import api from './client'
import type { User, AuthResponse, Board, BoardWithDetails, Issue, Column, Label } from '@nova-board/common'

// Auth API
export const authApi = {
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { email, password, name })
    return data
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    return data
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me')
    return data
  },
}

// Boards API
export const boardsApi = {
  list: async (): Promise<Board[]> => {
    const { data } = await api.get<Board[]>('/boards')
    return data
  },

  get: async (id: string): Promise<BoardWithDetails> => {
    const { data } = await api.get<BoardWithDetails>(`/boards/${id}`)
    return data
  },

  create: async (name: string, description?: string): Promise<Board> => {
    const { data } = await api.post<Board>('/boards', { name, description })
    return data
  },

  update: async (id: string, updates: { name?: string; description?: string }): Promise<Board> => {
    const { data } = await api.patch<Board>(`/boards/${id}`, updates)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/boards/${id}`)
  },
}

// Columns API
export const columnsApi = {
  create: async (boardId: string, name: string): Promise<Column> => {
    const { data } = await api.post<Column>(`/boards/${boardId}/columns`, { name })
    return data
  },

  update: async (id: string, updates: { name?: string; order?: number }): Promise<Column> => {
    const { data } = await api.patch<Column>(`/columns/${id}`, updates)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/columns/${id}`)
  },

  reorder: async (boardId: string, columnIds: string[]): Promise<Column[]> => {
    const { data } = await api.post<Column[]>(`/boards/${boardId}/columns/reorder`, { columnIds })
    return data
  },
}

// Issues API
export const issuesApi = {
  create: async (
    columnId: string,
    issue: { title: string; description?: string; priority?: string; assigneeId?: string }
  ): Promise<Issue> => {
    const { data } = await api.post<Issue>(`/columns/${columnId}/issues`, issue)
    return data
  },

  update: async (id: string, updates: Partial<Issue>): Promise<Issue> => {
    const { data } = await api.patch<Issue>(`/issues/${id}`, updates)
    return data
  },

  move: async (id: string, columnId: string, order: number): Promise<Issue> => {
    const { data } = await api.patch<Issue>(`/issues/${id}/move`, { columnId, order })
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/issues/${id}`)
  },
}

// Labels API
export const labelsApi = {
  list: async (boardId: string): Promise<Label[]> => {
    const { data } = await api.get<Label[]>(`/boards/${boardId}/labels`)
    return data
  },

  create: async (boardId: string, name: string, color: string): Promise<Label> => {
    const { data } = await api.post<Label>(`/boards/${boardId}/labels`, { name, color })
    return data
  },
}
