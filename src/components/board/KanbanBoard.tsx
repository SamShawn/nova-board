'use client'

import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import type { Project } from '@/types'
import styles from './KanbanBoard.module.css'

interface KanbanBoardProps {
  project: Project & {
    columns: Array<{
      id: string
      name: string
      order: number
      color: string | null
      issues: Array<{
        id: string
        title: string
        issueNumber: number
        priority: string
        assignee: { id: string; name: string | null; avatarUrl: string | null } | null
        labels: Array<{
          workspaceLabel: { id: string; name: string; color: string } | null
          projectLabel: { id: string; name: string; color: string } | null
        }>
      }>
    }>
  }
}

export function KanbanBoard({ project }: KanbanBoardProps) {
  const columns = project.columns

  return (
    <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
      <div className={styles.board}>
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} projectKey={project.key} />
        ))}
      </div>
    </SortableContext>
  )
}
