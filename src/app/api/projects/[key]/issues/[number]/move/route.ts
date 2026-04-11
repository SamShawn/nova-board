import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/projects/[key]/issues/[number]/move
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ key: string; number: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key, number } = await params

  const project = await prisma.project.findFirst({
    where: { key, workspace: { members: { some: { userId: session.user.id } } } },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { columnId, afterId, beforeId } = await req.json()
  const issueNumber = parseInt(number)
  if (isNaN(issueNumber)) return NextResponse.json({ error: 'Invalid issue number' }, { status: 400 })

  // Update the issue's column
  await prisma.issue.updateMany({
    where: { projectId: project.id, issueNumber },
    data: { columnId },
  })

  return NextResponse.json({ success: true })
}