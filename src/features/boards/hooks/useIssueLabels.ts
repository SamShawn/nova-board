import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useIssueLabels(projectKey: string, issueNumber: number) {
  const queryClient = useQueryClient()

  const toggleLabelMutation = useMutation({
    mutationFn: async ({ labelId, labelType, isApplied }: { labelId: string; labelType: string; isApplied: boolean }) => {
      const res = await fetch(`/api/projects/${projectKey}/issues/${issueNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isApplied
            ? { removeLabel: { labelId, labelType } }
            : { addLabel: { labelId, labelType } }
        ),
      })
      if (!res.ok) throw new Error('Failed to toggle label')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectKey] })
    },
  })

  return { toggleLabel: toggleLabelMutation.mutateAsync }
}
