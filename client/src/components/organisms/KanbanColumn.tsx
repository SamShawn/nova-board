import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { columnsApi } from '@/api'
import { useBoardStore } from '@/stores/boardStore'
import IssueCard from './IssueCard'
import { PlusIcon, MoreHorizontalIcon, TrashIcon, EditIcon } from '../atoms/Icons'
import IssueModal from './IssueModal'
import type { Column, Issue } from '@nova-board/common'
import styles from './KanbanColumn.module.css'

interface KanbanColumnProps {
  column: Column
  issues: Issue[]
  boardId: string
}

export default function KanbanColumn({ column, issues, boardId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(column.name)
  const queryClient = useQueryClient()
  const { updateColumn, removeColumn } = useBoardStore()

  const deleteMutation = useMutation({
    mutationFn: () => columnsApi.delete(column.id),
    onSuccess: () => {
      removeColumn(column.id)
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (name: string) => columnsApi.update(column.id, { name }),
    onSuccess: () => {
      updateColumn(column.id, { name: editName })
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== column.name) {
      updateMutation.mutate(editName.trim())
    } else {
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    if (confirm(`Delete column "${column.name}" and all its issues?`)) {
      deleteMutation.mutate()
    }
    setShowMenu(false)
  }

  return (
    <div
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.over : ''}`}
    >
      <div className={styles.header}>
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            className={styles.editInput}
            autoFocus
          />
        ) : (
          <h3 className={styles.title}>
            {column.name}
            <span className={styles.count}>{issues.length}</span>
          </h3>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => setShowIssueModal(true)}
            title="Add issue"
          >
            <PlusIcon size={16} />
          </button>
          <div className={styles.menuWrapper}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => setShowMenu(!showMenu)}
              title="More options"
            >
              <MoreHorizontalIcon size={16} />
            </button>
            {showMenu && (
              <div className={styles.menu}>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => {
                    setIsEditing(true)
                    setShowMenu(false)
                  }}
                >
                  <EditIcon size={14} />
                  Rename
                </button>
                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.danger}`}
                  onClick={handleDelete}
                >
                  <TrashIcon size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SortableContext
        items={issues.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.issues}>
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </SortableContext>

      <button
        type="button"
        className={styles.addButton}
        onClick={() => setShowIssueModal(true)}
      >
        <PlusIcon size={16} />
        Add issue
      </button>

      <IssueModal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        columnId={column.id}
        boardId={boardId}
      />
    </div>
  )
}
