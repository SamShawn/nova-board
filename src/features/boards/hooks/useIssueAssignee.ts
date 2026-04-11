import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useIssueAssignee(projectKey: string, issueNumber: number) {
  const queryClient = useQueryClient()

  const updateAssigneeMutation = useMutation({
    mutationFn: async (assigneeId: string | null) => {
      const res = await fetch(`/api/projects/${projectKey}/issues/${issueNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId }),
      })
      if (!res.ok) throw new Error('Failed to update assignee')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectKey] })
    },
  })

  return { updateAssignee: updateAssigneeMutation.mutateAsync }
}
