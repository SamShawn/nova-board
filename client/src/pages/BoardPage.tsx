import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { boardsApi } from '@/api'
import { useBoardStore } from '@/stores/boardStore'
import KanbanBoard from '@/components/organisms/KanbanBoard'
import styles from './BoardPage.module.css'

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { setCurrentBoard, setColumns, setIssues, setLabels } = useBoardStore()

  const { data: board, isLoading, error } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardsApi.get(boardId!),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  useEffect(() => {
    if (board) {
      setCurrentBoard(board)
      // Flatten issues from columns
      const allIssues = board.columns.flatMap((col) => col.issues || [])
      setColumns(board.columns)
      setIssues(allIssues)
      setLabels(board.labels || [])
    }
  }, [board, setCurrentBoard, setColumns, setIssues, setLabels])

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading board...</span>
      </div>
    )
  }

  if (error || !board) {
    return (
      <div className={styles.error}>
        <h2>Board not found</h2>
        <p>This board doesn't exist or you don't have access to it.</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{board.name}</h1>
          {board.description && (
            <p className={styles.description}>{board.description}</p>
          )}
        </div>
      </div>
      <KanbanBoard boardId={board.id} />
    </div>
  )
}
