import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  user: { id: string; name: string | null; avatarUrl: string | null }
}

export function useComments(projectKey: string, issueNumber: number) {
  const queryClient = useQueryClient()

  const commentsQuery = useQuery<Comment[]>({
    queryKey: ['project', projectKey, 'issues', issueNumber, 'comments'],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectKey}/issues/${issueNumber}/comments`)
      if (!res.ok) throw new Error('Failed to fetch comments')
      return res.json()
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/projects/${projectKey}/issues/${issueNumber}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('Failed to add comment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectKey, 'issues', issueNumber, 'comments'] })
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete comment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectKey, 'issues', issueNumber, 'comments'] })
    },
  })

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    addComment: addCommentMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
  }
}
