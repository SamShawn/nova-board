// WebSocket event types — architecture defined in V1, connected in V2

export type WSClientEvent =
  | { type: 'join_project'; projectId: string; userId: string }
  | { type: 'leave_project'; projectId: string; userId: string }
  | { type: 'move_issue'; issueId: string; columnId: string; order: number; projectId: string }
  | { type: 'update_issue'; issueId: string; data: Partial<IssueData>; projectId: string }

export type WSServerEvent =
  | { type: 'issue_created'; issue: IssueData; projectId: string }
  | { type: 'issue_updated'; issue: IssueData; projectId: string }
  | { type: 'issue_moved'; issueId: string; columnId: string; order: number; projectId: string }
  | { type: 'issue_deleted'; issueId: string; projectId: string }
  | { type: 'user_joined'; userId: string; projectId: string }
  | { type: 'user_left'; userId: string; projectId: string }
  | { type: 'comment_added'; comment: CommentData; projectId: string }

interface IssueData {
  id: string
  issueNumber: number
  title: string
  columnId: string
  order: number
}

interface CommentData {
  id: string
  content: string
  issueId: string
  userId: string
}
