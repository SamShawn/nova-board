import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useBoardStore } from '@/features/boards/stores/boardStore'
import type { Issue } from '@/types'

export function useIssues(projectKey: string) {
  const queryClient = useQueryClient()
  const { addIssue, updateIssue, removeIssue } = useBoardStore()

  const issuesQuery = useQuery({
    queryKey: ['project', projectKey, 'issues'],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectKey}/issues`)
      if (!res.ok) throw new Error('Failed to fetch issues')
      return res.json() as Promise<Issue[]>
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; columnId: string; priority?: string; description?: string }) => {
      const res = await fetch(`/api/projects/${projectKey}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create issue')
      return res.json()
    },
    onSuccess: (newIssue) => {
      addIssue(newIssue)
      queryClient.invalidateQueries({ queryKey: ['project', projectKey] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ number, ...data }: { number: number; title?: string; description?: string; priority?: string; assigneeId?: string }) => {
      const res = await fetch(`/api/projects/${projectKey}/issues/${number}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update issue')
      return res.json()
    },
    onSuccess: (updated) => {
      updateIssue(updated.id, updated)
      queryClient.invalidateQueries({ queryKey: ['project', projectKey] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (number: number) => {
      const res = await fetch(`/api/projects/${projectKey}/issues/${number}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete issue')
      return res.json()
    },
    onSuccess: (_, number) => {
      removeIssue(`proj-${number}`)
      queryClient.invalidateQueries({ queryKey: ['project', projectKey] })
    },
  })

  return {
    issues: issuesQuery.data ?? [],
    isLoading: issuesQuery.isLoading,
    createIssue: createMutation.mutateAsync,
    updateIssue: updateMutation.mutateAsync,
    deleteIssue: deleteMutation.mutateAsync,
  }
}