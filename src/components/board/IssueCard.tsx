'use client'

import styles from './IssueCard.module.css'

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
  projectKey: string
}

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.labels}>
        {issue.labels.slice(0, 3).map((label, i) => (
          <span
            key={i}
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
            {issue.assignee.avatarUrl ? (
              <img src={issue.assignee.avatarUrl} alt={issue.assignee.name || ''} />
            ) : (
              <span>{(issue.assignee.name || '?')[0].toUpperCase()}</span>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
