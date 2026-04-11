'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Workspace } from '@/types'

export function useWorkspaces() {
  const queryClient = useQueryClient()

  const workspacesQuery = useQuery({
    queryKey: ['workspaces'],
    queryFn: async (): Promise<Workspace[]> => {
      const res = await fetch('/api/workspaces')
      if (!res.ok) throw new Error('Failed to fetch workspaces')
      return res.json()
    },
  })

  const createWorkspace = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create workspace')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })

  return { workspaces: workspacesQuery.data ?? [], isLoading: workspacesQuery.isLoading, createWorkspace }
}
