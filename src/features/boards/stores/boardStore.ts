import { create } from 'zustand'
import type { Column, Issue } from '@/types'

interface BoardState {
  columns: Column[]
  issues: Issue[]
  activeIssue: Issue | null
  setColumns: (columns: Column[]) => void
  setIssues: (issues: Issue[]) => void
  setActiveIssue: (issue: Issue | null) => void
  moveIssue: (issueId: string, targetColumnId: string, newOrder: number) => void
  addIssue: (issue: Issue) => void
  updateIssue: (issueId: string, data: Partial<Issue>) => void
  removeIssue: (issueId: string) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  columns: [],
  issues: [],
  activeIssue: null,

  setColumns: (columns) => set({ columns: columns.sort((a, b) => a.order - b.order) }),
  setIssues: (issues) => set({ issues }),
  setActiveIssue: (issue) => set({ activeIssue: issue }),

  moveIssue: (issueId, targetColumnId, newOrder) =>
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === issueId
          ? { ...issue, columnId: targetColumnId, order: newOrder }
          : issue
      ),
    })),

  addIssue: (issue) =>
    set((state) => ({ issues: [...state.issues, issue] })),

  updateIssue: (issueId, data) =>
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === issueId ? { ...issue, ...data } : issue
      ),
    })),

  removeIssue: (issueId) =>
    set((state) => ({
      issues: state.issues.filter((issue) => issue.id !== issueId),
    })),
}))
