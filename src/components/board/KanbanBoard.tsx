'use client'

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import { useBoardStore } from '@/features/boards/stores/boardStore'
import { KanbanColumn } from './KanbanColumn'
import { IssueCard } from './IssueCard'
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
        _count?: { comments: number; subIssues: number }
      }>
    }>
  }
}

type ColumnWithIssues = KanbanBoardProps['project']['columns'][number]

export function KanbanBoard({ project }: KanbanBoardProps) {
  const { moveIssue } = useBoardStore()
  const columns: ColumnWithIssues[] = project.columns
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const activeIssueId = active.id as string
    const overId = over.id as string

    // Find target column
    const targetColumn = columns.find((c) => c.id === overId) ||
      columns.find((c) => c.issues.some((i) => i.id === overId))

    if (!targetColumn) return

    const activeIssue = columns.flatMap((c) => c.issues).find((i) => i.id === activeIssueId)
    if (!activeIssue) return

    // Calculate new order
    const targetIssues = targetColumn.issues
    const newIndex = targetIssues.findIndex((i) => i.id === overId)

    const newOrder = newIndex === -1 ? targetIssues.length : newIndex
    moveIssue(activeIssueId, targetColumn.id, newOrder)
  }

  const activeIssue = activeId
    ? columns.flatMap((c) => c.issues).find((i) => i.id === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} projectKey={project.key} />
        ))}
      </div>
      <DragOverlay>
        {activeIssue ? (
          <div className={styles.dragOverlay}>
            <IssueCard issue={activeIssue} projectKey={project.key} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
