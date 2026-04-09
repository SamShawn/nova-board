import { create } from 'zustand'
import type { Board, Column, Issue, Label } from '@nova-board/common'

interface BoardState {
  boards: Board[]
  currentBoard: Board | null
  columns: Column[]
  issues: Issue[]
  labels: Label[]

  setBoards: (boards: Board[]) => void
  setCurrentBoard: (board: Board | null) => void
  setColumns: (columns: Column[]) => void
  setIssues: (issues: Issue[]) => void
  setLabels: (labels: Label[]) => void

  addBoard: (board: Board) => void
  updateBoard: (id: string, updates: Partial<Board>) => void
  removeBoard: (id: string) => void

  addColumn: (column: Column) => void
  updateColumn: (id: string, updates: Partial<Column>) => void
  removeColumn: (id: string) => void
  reorderColumns: (columnIds: string[]) => void

  addIssue: (issue: Issue) => void
  updateIssue: (id: string, updates: Partial<Issue>) => void
  removeIssue: (id: string) => void
  moveIssue: (issueId: string, columnId: string, order: number) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  boards: [],
  currentBoard: null,
  columns: [],
  issues: [],
  labels: [],

  setBoards: (boards) => set({ boards }),
  setCurrentBoard: (board) => set({ currentBoard: board }),
  setColumns: (columns) => set({ columns }),
  setIssues: (issues) => set({ issues }),
  setLabels: (labels) => set({ labels }),

  addBoard: (board) => set((state) => ({ boards: [...state.boards, board] })),
  updateBoard: (id, updates) =>
    set((state) => ({
      boards: state.boards.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),
  removeBoard: (id) =>
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
    })),

  addColumn: (column) => set((state) => ({ columns: [...state.columns, column] })),
  updateColumn: (id, updates) =>
    set((state) => ({
      columns: state.columns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  removeColumn: (id) =>
    set((state) => ({
      columns: state.columns.filter((c) => c.id !== id),
    })),
  reorderColumns: (columnIds) =>
    set((state) => ({
      columns: columnIds
        .map((id, index) => {
          const col = state.columns.find((c) => c.id === id)
          return col ? { ...col, order: index } : null
        })
        .filter((c): c is Column => c !== null),
    })),

  addIssue: (issue) => set((state) => ({ issues: [...state.issues, issue] })),
  updateIssue: (id, updates) =>
    set((state) => ({
      issues: state.issues.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),
  removeIssue: (id) =>
    set((state) => ({
      issues: state.issues.filter((i) => i.id !== id),
    })),
  moveIssue: (issueId, columnId, order) =>
    set((state) => ({
      issues: state.issues.map((i) =>
        i.id === issueId ? { ...i, columnId, order } : i
      ),
    })),
}))
