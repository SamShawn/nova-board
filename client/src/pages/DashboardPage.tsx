import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { boardsApi } from '@/api'
import { useBoardStore } from '@/stores/boardStore'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Modal } from '@/components/molecules/Modal'
import { PlusIcon, LayoutGridIcon } from '@/components/atoms/Icons'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { boards, setBoards, addBoard } = useBoardStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')

  // Fetch boards from API
  const { data: apiBoards, isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: boardsApi.list,
    onSuccess: (data) => {
      setBoards(data)
    },
  })

  const createMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      boardsApi.create(name, description),
    onSuccess: (newBoard) => {
      addBoard(newBoard)
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      setShowCreateModal(false)
      setNewBoardName('')
      setNewBoardDescription('')
      navigate(`/board/${newBoard.id}`)
    },
  })

  const displayBoards = apiBoards || boards

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoardName.trim()) return
    createMutation.mutate({
      name: newBoardName,
      description: newBoardDescription || undefined,
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Manage your project boards</p>
        </div>
        <Button icon={<PlusIcon size={18} />} onClick={() => setShowCreateModal(true)}>
          New Board
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading boards...</span>
        </div>
      ) : displayBoards.length === 0 ? (
        <div className={styles.empty}>
          <LayoutGridIcon size={48} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No boards yet</h2>
          <p className={styles.emptyText}>
            Create your first board to start tracking issues
          </p>
          <Button icon={<PlusIcon size={18} />} onClick={() => setShowCreateModal(true)}>
            Create Board
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {displayBoards.map((board) => (
            <button
              key={board.id}
              type="button"
              className={styles.boardCard}
              onClick={() => navigate(`/board/${board.id}`)}
            >
              <div className={styles.boardIcon}>
                <LayoutGridIcon size={24} />
              </div>
              <div className={styles.boardInfo}>
                <h3 className={styles.boardName}>{board.name}</h3>
                {board.description && (
                  <p className={styles.boardDescription}>{board.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Board"
        size="sm"
      >
        <form onSubmit={handleCreateBoard} className={styles.createForm}>
          <Input
            label="Board Name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="e.g., Product Roadmap"
            autoFocus
            required
          />
          <Input
            label="Description (optional)"
            value={newBoardDescription}
            onChange={(e) => setNewBoardDescription(e.target.value)}
            placeholder="Brief description of this board"
          />
          <div className={styles.createFormActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Board
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
