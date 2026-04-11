import { create } from 'zustand'
import type { Column, Issue } from '@/types'

interface BoardState {
  columns: Column[]
  issues: Issue[]
  activeIssue: Issue | null
  setColumns: (columns: Column[]) => void
  setIssues: (issues: Issue[]) => void
  setActiveIssue: (issue: Issue | null) => void
  moveIssue: (issueId: string, columnId: string, newOrder: number) => void
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
    set((state) => {
      // Find the issue across all columns
      let movedIssue: Issue | null = null
      let sourceColumnId: string | null = null

      for (const col of state.columns) {
        const issues = col.issues || []
        const found = issues.find((i) => i.id === issueId)
        if (found) {
          movedIssue = found
          sourceColumnId = col.id
          break
        }
      }

      if (!movedIssue || !sourceColumnId) return state

      // Remove from source column and get remaining issues
      const newColumns = state.columns.map((col) => {
        if (col.id === sourceColumnId) {
          const issues = col.issues || []
          return {
            ...col,
            issues: issues
              .filter((i) => i.id !== issueId)
              .map((issue, idx) => ({ ...issue, order: idx })),
          }
        }
        return col
      })

      // If moving to a different column
      if (sourceColumnId !== targetColumnId) {
        // Add to target column at newOrder position
        return {
          columns: newColumns.map((col) => {
            if (col.id === targetColumnId) {
              const issues = col.issues || []
              const updatedIssues = [...issues]
              const movedIssueWithNewColumn = { ...movedIssue, columnId: targetColumnId, order: newOrder }
              updatedIssues.splice(newOrder, 0, movedIssueWithNewColumn as Issue)
              return {
                ...col,
                issues: updatedIssues.map((issue, idx) => ({ ...issue, order: idx })),
              }
            }
            return col
          }),
        }
      }

      // Same column reorder
      return {
        columns: newColumns.map((col) => {
          if (col.id === sourceColumnId) {
            const issues = [...(col.issues || [])]
            const oldIndex = issues.findIndex((i) => i.id === issueId)
            const reordered = arrayMove(issues, oldIndex, newOrder)
            return {
              ...col,
              issues: reordered.map((issue, idx) => ({ ...issue, order: idx })),
            }
          }
          return col
        }),
      }
    }),

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

function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const arr = [...array]
  const [item] = arr.splice(from, 1)
  arr.splice(to, 0, item)
  return arr
}
