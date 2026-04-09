import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBoardStore } from '@/stores/boardStore'
import { columnsApi, issuesApi } from '@/api'
import KanbanColumn from './KanbanColumn'
import IssueCard from './IssueCard'
import type { Issue } from '@nova-board/common'
import styles from './KanbanBoard.module.css'

interface KanbanBoardProps {
  boardId: string
}

export default function KanbanBoard({ boardId }: KanbanBoardProps) {
  const { columns, issues, addColumn, moveIssue } = useBoardStore()
  const queryClient = useQueryClient()
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addColumnMutation = useMutation({
    mutationFn: (name: string) => columnsApi.create(boardId, name),
    onSuccess: (newColumn) => {
      addColumn(newColumn)
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const moveIssueMutation = useMutation({
    mutationFn: ({ issueId, columnId, order }: { issueId: string; columnId: string; order: number }) =>
      issuesApi.move(issueId, columnId, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const handleDragStart = (event: DragStartEvent) => {
    const issueId = event.active.id as string
    const issue = issues.find((i) => i.id === issueId)
    setActiveIssue(issue || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the active issue and its current column
    const activeIssue = issues.find((i) => i.id === activeId)
    if (!activeIssue) return

    // Check if we're over a column
    const overColumn = columns.find((c) => c.id === overId)
    if (overColumn && activeIssue.columnId !== overId) {
      // Move issue to new column (optimistic update)
      moveIssue(activeId, overId, activeIssue.order)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveIssue(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the issue being dragged
    const draggedIssue = issues.find((i) => i.id === activeId)
    if (!draggedIssue) return

    // Determine target column and order
    let targetColumnId = draggedIssue.columnId
    let targetOrder = draggedIssue.order

    // Check if dropped on a column
    const targetColumn = columns.find((c) => c.id === overId)
    if (targetColumn) {
      targetColumnId = targetColumn.id
      targetOrder = targetColumn.issues?.length || 0
    } else {
      // Dropped on another issue
      const targetIssue = issues.find((i) => i.id === overId)
      if (targetIssue) {
        targetColumnId = targetIssue.columnId
        targetOrder = targetIssue.order
      }
    }

    // Only persist if actually moved
    if (targetColumnId !== activeIssue?.columnId || targetOrder !== activeIssue?.order) {
      moveIssueMutation.mutate({
        issueId: activeId,
        columnId: targetColumnId,
        order: targetOrder,
      })
    }
  }

  const handleAddColumn = () => {
    const name = prompt('Enter column name:')
    if (name?.trim()) {
      addColumnMutation.mutate(name.trim())
    }
  }

  // Sort columns by order
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {sortedColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            issues={issues.filter((i) => i.columnId === column.id).sort((a, b) => a.order - b.order)}
            boardId={boardId}
          />
        ))}

        <button
          type="button"
          className={styles.addColumn}
          onClick={handleAddColumn}
        >
          + Add Column
        </button>
      </div>

      <DragOverlay>
        {activeIssue && (
          <IssueCard issue={activeIssue} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  )
}
