'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MessageSquare, GitPullRequest } from 'lucide-react'
import { Badge, Avatar } from '@/components/ui'
import { useBoardStore } from '@/features/boards/stores/boardStore'
import type { Issue } from '@/types'
import styles from './IssueCard.module.css'

const priorityColors: Record<string, string> = {
  LOW: 'var(--priority-low)',
  MEDIUM: 'var(--priority-medium)',
  HIGH: 'var(--priority-high)',
  URGENT: 'var(--priority-urgent)',
}

interface IssueCardProps {
  issue: {
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
  }
  projectKey: string
}

export function IssueCard({ issue, projectKey }: IssueCardProps) {
  const { setActiveIssue } = useBoardStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const labels = issue.labels
    .map((l) => l.workspaceLabel || l.projectLabel)
    .filter(Boolean)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      onClick={() => setActiveIssue(issue as Issue)}
    >
      <div className={styles.priority} style={{ background: priorityColors[issue.priority] }} />
      <div className={styles.labels}>
        {labels.slice(0, 3).map((label) => (
          label && <Badge key={label.id} color={label.color} size="sm">{label.name}</Badge>
        ))}
      </div>
      <div className={styles.title}>
        <span className={styles.issueNum}>{projectKey}-{issue.issueNumber}</span>
        {issue.title}
      </div>
      <div className={styles.footer}>
        {issue._count?.subIssues ? (
          <span className={styles.meta}><GitPullRequest size={12} /> {issue._count.subIssues}</span>
        ) : null}
        {issue._count?.comments ? (
          <span className={styles.meta}><MessageSquare size={12} /> {issue._count.comments}</span>
        ) : null}
        {issue.assignee && (
          <Avatar name={issue.assignee.name} size={20} className={styles.avatar} />
        )}
      </div>
    </div>
  )
}