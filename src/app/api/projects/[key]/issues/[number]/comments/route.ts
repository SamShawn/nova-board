import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[key]/issues/[number]/comments
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string; number: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key, number } = await params

  const project = await prisma.project.findFirst({
    where: { key, workspace: { members: { some: { userId: session.user.id } } } },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const issueNumber = parseInt(number)
  if (isNaN(issueNumber)) return NextResponse.json({ error: 'Invalid issue number' }, { status: 400 })

  const issue = await prisma.issue.findFirst({
    where: { projectId: project.id, issueNumber },
  })
  if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 })

  const comments = await prisma.comment.findMany({
    where: { issueId: issue.id },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(comments)
}

// POST /api/projects/[key]/issues/[number]/comments
export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string; number: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key, number } = await params

  const project = await prisma.project.findFirst({
    where: { key, workspace: { members: { some: { userId: session.user.id } } } },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const issueNumber = parseInt(number)
  if (isNaN(issueNumber)) return NextResponse.json({ error: 'Invalid issue number' }, { status: 400 })

  const issue = await prisma.issue.findFirst({
    where: { projectId: project.id, issueNumber },
  })
  if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 })

  const { content } = await req.json()
  if (!content || !content.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      userId: session.user.id,
      issueId: issue.id,
    },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  return NextResponse.json(comment, { status: 201 })
}
