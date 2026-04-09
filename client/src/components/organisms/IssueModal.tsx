import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { issuesApi } from '@/api'
import { useBoardStore } from '@/stores/boardStore'
import { Modal } from '../molecules/Modal'
import { Button } from '../atoms/Button'
import { Input, Textarea } from '../atoms/Input'
import { Avatar } from '../atoms/Avatar'
import { ChevronDownIcon } from '../atoms/Icons'
import type { Priority } from '@nova-board/common'
import styles from './IssueModal.module.css'

interface IssueModalProps {
  isOpen: boolean
  onClose: () => void
  columnId: string
  boardId: string
  issue?: {
    id: string
    title: string
    description?: string
    priority: Priority
    assigneeId?: string
    dueDate?: string
  }
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: 'var(--priority-low)' },
  { value: 'MEDIUM', label: 'Medium', color: 'var(--priority-medium)' },
  { value: 'HIGH', label: 'High', color: 'var(--priority-high)' },
  { value: 'URGENT', label: 'Urgent', color: 'var(--priority-urgent)' },
]

export default function IssueModal({ isOpen, onClose, columnId, boardId, issue }: IssueModalProps) {
  const [title, setTitle] = useState(issue?.title || '')
  const [description, setDescription] = useState(issue?.description || '')
  const [priority, setPriority] = useState<Priority>(issue?.priority || 'MEDIUM')
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const queryClient = useQueryClient()
  const { addIssue, updateIssue } = useBoardStore()

  const isEditing = !!issue

  const createMutation = useMutation({
    mutationFn: () => issuesApi.create(columnId, { title, description, priority }),
    onSuccess: (newIssue) => {
      addIssue(newIssue)
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      issuesApi.update(issue!.id, { title, description, priority }),
    onSuccess: (updatedIssue) => {
      updateIssue(issue!.id, updatedIssue)
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      handleClose()
    },
  })

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setPriority('MEDIUM')
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    if (isEditing) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const selectedPriority = priorities.find((p) => p.value === priority)

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? 'Edit Issue' : 'Create Issue'} size="md">
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter issue title"
          autoFocus
          required
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={4}
        />

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Priority</label>
            <div className={styles.dropdownWrapper}>
              <button
                type="button"
                className={styles.dropdownTrigger}
                onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
              >
                <span
                  className={styles.priorityDot}
                  style={{ backgroundColor: selectedPriority?.color }}
                />
                {selectedPriority?.label}
                <ChevronDownIcon size={16} />
              </button>
              {showPriorityDropdown && (
                <div className={styles.dropdown}>
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={`${styles.dropdownItem} ${p.value === priority ? styles.selected : ''}`}
                      onClick={() => {
                        setPriority(p.value)
                        setShowPriorityDropdown(false)
                      }}
                    >
                      <span
                        className={styles.priorityDot}
                        style={{ backgroundColor: p.color }}
                      />
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? 'Save Changes' : 'Create Issue'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
