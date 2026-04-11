import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[key]/issues
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key } = await params

  const project = await prisma.project.findFirst({
    where: { key, workspace: { members: { some: { userId: session.user.id } } } },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const issues = await prisma.issue.findMany({
    where: { projectId: project.id },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      labels: true,
      _count: { select: { comments: true, subIssues: true } },
    },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(issues)
}

// POST /api/projects/[key]/issues
export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key } = await params

  const project = await prisma.project.findFirst({
    where: { key, workspace: { members: { some: { userId: session.user.id } } } },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { title, description, columnId, priority } = await req.json()
  if (!title || !columnId) return NextResponse.json({ error: 'Title and columnId required' }, { status: 400 })

  // Get max issueNumber for this project
  const lastIssueByNumber = await prisma.issue.findFirst({
    where: { projectId: project.id },
    orderBy: { issueNumber: 'desc' },
  })

  const lastIssue = await prisma.issue.findFirst({
    where: { projectId: project.id, columnId },
    orderBy: { order: 'desc' },
  })

  const issue = await prisma.issue.create({
    data: {
      title,
      description,
      columnId,
      priority: priority || 'MEDIUM',
      projectId: project.id,
      reporterId: session.user.id,
      issueNumber: (lastIssueByNumber?.issueNumber ?? 0) + 1,
      order: (lastIssue?.order ?? -1) + 1,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      labels: true,
      _count: { select: { comments: true, subIssues: true } },
    },
  })

  return NextResponse.json(issue, { status: 201 })
}