'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, MoreHorizontal } from 'lucide-react'
import { IssueCard } from './IssueCard'
import { Input, Button } from '@/components/ui'
import styles from './KanbanColumn.module.css'

interface KanbanColumnProps {
  column: {
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
  }
  projectKey: string
}

export function KanbanColumn({ column, projectKey }: KanbanColumnProps) {
  const [addingIssue, setAddingIssue] = useState(false)
  const [newIssueTitle, setNewIssueTitle] = useState('')

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const issueIds = column.issues.map((i) => i.id)

  return (
    <div
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.over : ''}`}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {column.color && (
            <span className={styles.colorDot} style={{ background: column.color }} />
          )}
          <span className={styles.title}>{column.name}</span>
          <span className={styles.count}>{column.issues.length}</span>
        </div>
        <button className={styles.menuBtn}>
          <MoreHorizontal size={14} />
        </button>
      </div>

      <SortableContext items={issueIds} strategy={verticalListSortingStrategy}>
        <div className={styles.issues}>
          {column.issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </SortableContext>

      {addingIssue ? (
        <div className={styles.addForm}>
          <Input
            autoFocus
            placeholder="Issue title..."
            value={newIssueTitle}
            onChange={(e) => setNewIssueTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newIssueTitle.trim()) {
                // TODO: Create issue via mutation (Task 12)
                setAddingIssue(false)
                setNewIssueTitle('')
              }
              if (e.key === 'Escape') {
                setAddingIssue(false)
                setNewIssueTitle('')
              }
            }}
          />
          <div className={styles.addActions}>
            <Button size="sm" onClick={() => {
              if (newIssueTitle.trim()) {
                // TODO: Create issue via mutation (Task 12)
                setAddingIssue(false)
                setNewIssueTitle('')
              }
            }}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAddingIssue(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button className={styles.addBtn} onClick={() => setAddingIssue(true)}>
          <Plus size={14} /> Add issue
        </button>
      )}
    </div>
  )
}
