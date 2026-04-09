import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { clsx } from 'clsx'
import type { Issue } from '@nova-board/common'
import { Avatar } from '../atoms/Avatar'
import { PriorityBadge } from '../atoms/PriorityBadge'
import { CalendarIcon, MessageSquareIcon, PaperclipIcon } from '../atoms/Icons'
import styles from './IssueCard.module.css'

interface IssueCardProps {
  issue: Issue
  isDragging?: boolean
}

export default function IssueCard({ issue, isDragging = false }: IssueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: issue.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const hasLabels = issue.labels && issue.labels.length > 0
  const hasSubtasks = issue.subtasks && issue.subtasks.length > 0
  const completedSubtasks = issue.subtasks?.filter((s) => s.completed).length || 0
  const hasComments = issue.comments && issue.comments.length > 0
  const hasAttachments = false // TODO: implement attachments

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        styles.card,
        (isDragging || isSortableDragging) && styles.dragging
      )}
      {...attributes}
    >
      {/* Drag Handle */}
      <div className={styles.dragHandle} {...listeners}>
        <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="6" cy="2" r="1.5" />
          <circle cx="2" cy="7" r="1.5" />
          <circle cx="6" cy="7" r="1.5" />
          <circle cx="2" cy="12" r="1.5" />
          <circle cx="6" cy="12" r="1.5" />
        </svg>
      </div>

      {/* Labels */}
      {hasLabels && (
        <div className={styles.labels}>
          {issue.labels.map((label) => (
            <span
              key={label.id}
              className={styles.label}
              style={{ backgroundColor: label.color }}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className={styles.title}>{issue.title}</h4>

      {/* Description preview */}
      {issue.description && (
        <p className={styles.description}>
          {issue.description.slice(0, 80)}
          {issue.description.length > 80 ? '...' : ''}
        </p>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.meta}>
          <PriorityBadge priority={issue.priority} size="sm" />

          {issue.dueDate && (
            <span className={styles.metaItem}>
              <CalendarIcon size={12} />
              {new Date(issue.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}

          {hasSubtasks && (
            <span className={styles.metaItem}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,11 12,14 22,4" />
                <path d="M21,12v7a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V5a2,2,0,0,1,2-2h11" />
              </svg>
              {completedSubtasks}/{issue.subtasks.length}
            </span>
          )}

          {hasComments && (
            <span className={styles.metaItem}>
              <MessageSquareIcon size={12} />
              {issue.comments.length}
            </span>
          )}

          {hasAttachments && (
            <span className={styles.metaItem}>
              <PaperclipIcon size={12} />
            </span>
          )}
        </div>

        {issue.assignee && (
          <Avatar
            name={issue.assignee.name}
            src={issue.assignee.avatar}
            size="sm"
          />
        )}
      </div>
    </div>
  )
}
