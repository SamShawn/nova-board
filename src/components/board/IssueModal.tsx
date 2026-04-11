'use client'

import { useState, useEffect } from 'react'
import { X, MessageSquare, GitPullRequest, Plus, Check, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Modal, Button, Badge, Avatar, Select, Dropdown, DropdownItem } from '@/components/ui'
import { useBoardStore } from '@/features/boards/stores/boardStore'
import { useIssues } from '@/features/boards/hooks/useIssues'
import { useIssueLabels } from '@/features/boards/hooks/useIssueLabels'
import { useIssueAssignee } from '@/features/boards/hooks/useIssueAssignee'
import { useComments } from '@/features/boards/hooks/useComments'
import type { WorkspaceLabel, ProjectLabel, WorkspaceMember } from '@/types'
import styles from './IssueModal.module.css'

interface IssueModalProps {
  projectKey: string
  workspaceSlug?: string
}

export function IssueModal({ projectKey, workspaceSlug = 'default' }: IssueModalProps) {
  const { activeIssue, setActiveIssue } = useBoardStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')
  const [newComment, setNewComment] = useState('')

  const { data: session } = useSession()
  const { updateIssue } = useIssues(projectKey)
  const { toggleLabel } = useIssueLabels(projectKey, activeIssue?.issueNumber ?? 0)
  const { updateAssignee } = useIssueAssignee(projectKey, activeIssue?.issueNumber ?? 0)
  const { comments, isLoading: commentsLoading, addComment, deleteComment } = useComments(projectKey, activeIssue?.issueNumber ?? 0)

  // Fetch workspace labels
  const { data: workspaceLabels = [] } = useQuery<WorkspaceLabel[]>({
    queryKey: ['workspace', workspaceSlug, 'labels'],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}/labels`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: !!workspaceSlug && !!activeIssue,
  })

  // Fetch project labels
  const { data: projectLabels = [] } = useQuery<ProjectLabel[]>({
    queryKey: ['project', projectKey, 'labels'],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectKey}/labels`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: !!activeIssue,
  })

  // Fetch workspace members for assignee selector
  const { data: members = [] } = useQuery<WorkspaceMember[]>({
    queryKey: ['workspace', workspaceSlug, 'members'],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}/members`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: !!workspaceSlug && !!activeIssue,
  })

  useEffect(() => {
    if (activeIssue) {
      setTitle(activeIssue.title)
      setDescription((activeIssue as any).description || '')
      setPriority(activeIssue.priority)
    }
  }, [activeIssue])

  if (!activeIssue) return null

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ]

  const handlePriorityChange = async (val: string) => {
    setPriority(val as typeof priority)
    try {
      await updateIssue({ number: activeIssue.issueNumber, priority: val as typeof priority })
    } catch (e) {
      // Revert on error
      setPriority(activeIssue.priority)
    }
  }

  const handleToggleLabel = async (labelId: string, labelType: string, isApplied: boolean) => {
    try {
      await toggleLabel({ labelId, labelType, isApplied })
    } catch (e) {
      // Handle error silently
    }
  }

  const handleAssigneeChange = async (userId: string | null) => {
    try {
      await updateAssignee(userId)
    } catch (e) {
      // Handle error silently
    }
  }

  // Get current label IDs for this issue
  const currentLabelIds = new Set(
    activeIssue.labels.map(l => l.workspaceLabel?.id || l.projectLabel?.id).filter(Boolean)
  )

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
            value={priority}
            options={priorityOptions}
            onChange={handlePriorityChange}
            className={styles.select}
          />
        </div>

        <div className={styles.metaRow}>
          <label className={styles.metaLabel}>Assignee</label>
          <Dropdown
            trigger={
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
            }
            align="left"
          >
            <DropdownItem onClick={() => handleAssigneeChange(null)}>
              <span className={styles.unassigned}>Unassigned</span>
            </DropdownItem>
            {members.map((member) => (
              <DropdownItem
                key={member.id}
                onClick={() => handleAssigneeChange(member.userId)}
              >
                <div className={styles.memberItem}>
                  <Avatar name={member.user.name} size={20} />
                  <span>{member.user.name}</span>
                  {member.userId === activeIssue.assigneeId && (
                    <Check size={14} className={styles.checkIcon} />
                  )}
                </div>
              </DropdownItem>
            ))}
          </Dropdown>
        </div>

        <div className={styles.metaRow}>
          <label className={styles.metaLabel}>Labels</label>
          <Dropdown
            trigger={
              <div className={styles.labelsRow}>
                {activeIssue.labels.length > 0 ? (
                  activeIssue.labels.map((label) =>
                    label.workspaceLabel || label.projectLabel ? (
                      <Badge
                        key={(label.workspaceLabel || label.projectLabel)?.id}
                        color={(label.workspaceLabel || label.projectLabel)?.color}
                        size="sm"
                      >
                        {(label.workspaceLabel || label.projectLabel)?.name}
                      </Badge>
                    ) : null
                  )
                ) : (
                  <span className={styles.noLabels}>No labels</span>
                )}
              </div>
            }
            align="left"
          >
            {workspaceLabels.length === 0 && projectLabels.length === 0 && (
              <div className={styles.noLabels}>No labels available</div>
            )}
            {workspaceLabels.map((label) => (
              <DropdownItem
                key={`ws-${label.id}`}
                onClick={() => handleToggleLabel(label.id, 'WORKSPACE', currentLabelIds.has(label.id))}
              >
                <div className={styles.labelItem}>
                  <span
                    className={styles.labelDot}
                    style={{ backgroundColor: label.color }}
                  />
                  <span>{label.name}</span>
                  {currentLabelIds.has(label.id) && (
                    <Check size={14} className={styles.checkIcon} />
                  )}
                </div>
              </DropdownItem>
            ))}
            {projectLabels.map((label) => (
              <DropdownItem
                key={`proj-${label.id}`}
                onClick={() => handleToggleLabel(label.id, 'PROJECT', currentLabelIds.has(label.id))}
              >
                <div className={styles.labelItem}>
                  <span
                    className={styles.labelDot}
                    style={{ backgroundColor: label.color }}
                  />
                  <span>{label.name}</span>
                  {currentLabelIds.has(label.id) && (
                    <Check size={14} className={styles.checkIcon} />
                  )}
                </div>
              </DropdownItem>
            ))}
          </Dropdown>
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

        {commentsLoading ? (
          <p className={styles.emptyText}>Loading comments...</p>
        ) : comments.length > 0 ? (
          <div className={styles.commentsList}>
            {comments.map((comment) => (
              <div key={comment.id} className={styles.commentItem}>
                <Avatar name={comment.user.name ?? 'User'} size={28} />
                <div className={styles.commentContent}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>{comment.user.name ?? 'Unknown'}</span>
                    <span className={styles.commentTime}>
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {session?.user?.id === comment.user.id && (
                      <button
                        className={styles.deleteCommentBtn}
                        onClick={() => deleteComment(comment.id)}
                        title="Delete comment"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className={styles.commentText}>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyText}>No comments yet</p>
        )}

        <div className={styles.addCommentForm}>
          <textarea
            className={styles.commentInput}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
          />
          <Button
            size="sm"
            variant="primary"
            onClick={async () => {
              if (newComment.trim()) {
                await addComment(newComment.trim())
                setNewComment('')
              }
            }}
            disabled={!newComment.trim()}
          >
            Add Comment
          </Button>
        </div>
      </div>
    </Modal>
  )
}
