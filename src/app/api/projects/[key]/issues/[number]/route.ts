import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[key]/issues/[number]
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
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      labels: true,
      comments: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      subIssues: true,
      _count: { select: { comments: true, subIssues: true } },
    },
  })

  if (!issue) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(issue)
}

// PATCH /api/projects/[key]/issues/[number]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ key: string; number: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key, number } = await params

  const project = await prisma.project.findFirst({
    where: { key, workspace: { members: { some: { userId: session.user.id } } } },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const issueNumber = parseInt(number)
  if (isNaN(issueNumber)) return NextResponse.json({ error: 'Invalid issue number' }, { status: 400 })

  const { title, description, priority, assigneeId, addLabel, removeLabel } = await req.json()

  // Get existing issue first
  const existingIssue = await prisma.issue.findFirst({
    where: { projectId: project.id, issueNumber },
  })
  if (!existingIssue) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Handle label operations
  if (addLabel) {
    const { labelId, labelType } = addLabel
    await prisma.issueLabel.create({
      data: { issueId: existingIssue.id, labelId, labelType },
    })
  }

  if (removeLabel) {
    const { labelId, labelType } = removeLabel
    await prisma.issueLabel.deleteMany({
      where: { issueId: existingIssue.id, labelId, labelType },
    })
  }

  const issue = await prisma.issue.updateMany({
    where: { projectId: project.id, issueNumber },
    data: { title, description, priority, assigneeId },
  })

  if (issue.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.issue.findFirst({
    where: { projectId: project.id, issueNumber },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      labels: true,
      _count: { select: { comments: true, subIssues: true } },
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/projects/[key]/issues/[number]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ key: string; number: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key, number } = await params

  const project = await prisma.project.findFirst({
    where: { key, workspace: { members: { some: { userId: session.user.id } } } },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const issueNumber = parseInt(number)
  if (isNaN(issueNumber)) return NextResponse.json({ error: 'Invalid issue number' }, { status: 400 })

  await prisma.issue.deleteMany({ where: { projectId: project.id, issueNumber } })
  return NextResponse.json({ success: true })
}