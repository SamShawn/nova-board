'use client'

import { useState, useEffect } from 'react'
import { X, MessageSquare, GitPullRequest, Plus } from 'lucide-react'
import { Modal, Button, Badge, Avatar, Select } from '@/components/ui'
import { useBoardStore } from '@/features/boards/stores/boardStore'
import styles from './IssueModal.module.css'

interface IssueModalProps {
  projectKey: string
}

export function IssueModal({ projectKey }: IssueModalProps) {
  const { activeIssue, setActiveIssue } = useBoardStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (activeIssue) {
      setTitle(activeIssue.title)
      setDescription(activeIssue.description || '')
    }
  }, [activeIssue])

  if (!activeIssue) return null

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ]

  return (
    <Modal open={!!activeIssue} onClose={() => setActiveIssue(null)} className={styles.modal}>
      <div className={styles.header}>
        <span className={styles.issueNum}>{projectKey}-{activeIssue.issueNumber}</span>
        <button className={styles.closeBtn} onClick={() => setActiveIssue(null)}>
          <X size={18} />
        </button>
      </div>

      <input
        className={styles.titleInput}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Issue title"
      />

      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <label className={styles.metaLabel}>Priority</label>
          <Select
            value={activeIssue.priority}
            options={priorityOptions}
            onChange={() => {}}
            className={styles.select}
          />
        </div>

        <div className={styles.metaRow}>
          <label className={styles.metaLabel}>Assignee</label>
          <div className={styles.assigneeRow}>
            {activeIssue.assignee ? (
              <>
                <Avatar name={activeIssue.assignee.name} size={24} />
                <span>{activeIssue.assignee.name}</span>
              </>
            ) : (
              <span className={styles.unassigned}>Unassigned</span>
            )}
          </div>
        </div>

        <div className={styles.metaRow}>
          <label className={styles.metaLabel}>Labels</label>
          <div className={styles.labelsRow}>
            {activeIssue.labels.map((label) => (
              label.workspaceLabel || label.projectLabel ? (
                <Badge
                  key={(label.workspaceLabel || label.projectLabel)?.id}
                  color={(label.workspaceLabel || label.projectLabel)?.color}
                  size="sm"
                >
                  {(label.workspaceLabel || label.projectLabel)?.name}
                </Badge>
              ) : null
            ))}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Description</h3>
        <textarea
          className={styles.descInput}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={4}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <GitPullRequest size={14} /> Sub-issues
          </h3>
          <Button size="sm" variant="ghost"><Plus size={14} /> Add</Button>
        </div>
        {(activeIssue as any)._count?.subIssues > 0 ? (
          <p className={styles.subIssueCount}>{(activeIssue as any)._count.subIssues} sub-issues</p>
        ) : (
          <p className={styles.emptyText}>No sub-issues yet</p>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <MessageSquare size={14} /> Comments
          </h3>
        </div>
        {(activeIssue as any)._count?.comments > 0 ? (
          <p className={styles.commentCount}>{(activeIssue as any)._count.comments} comments</p>
        ) : (
          <p className={styles.emptyText}>No comments yet</p>
        )}
      </div>
    </Modal>
  )
}