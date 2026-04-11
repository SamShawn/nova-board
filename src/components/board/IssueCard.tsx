'use client'

import styles from './IssueCard.module.css'

// Validate avatar URL is safe (http/https only)
function isValidAvatarUrl(url: string | null): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
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
  }
}

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.labels}>
        {issue.labels.slice(0, 3).map((label) => (
          <span
            key={label.workspaceLabel?.id || label.projectLabel?.id}
            className={styles.label}
            style={{ backgroundColor: label.workspaceLabel?.color || label.projectLabel?.color || '#6366f1' }}
          >
            {label.workspaceLabel?.name || label.projectLabel?.name}
          </span>
        ))}
      </div>
      <div className={styles.title}>{issue.title}</div>
      <div className={styles.meta}>
        <span className={styles.issueNum}>#{issue.issueNumber}</span>
        {issue.assignee && (
          <span className={styles.assignee}>
            {isValidAvatarUrl(issue.assignee.avatarUrl) ? (
              <img src={issue.assignee.avatarUrl} alt={issue.assignee.name || ''} />
            ) : (
              <span>{(issue.assignee.name?.charAt(0) || '?').toUpperCase()}</span>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
