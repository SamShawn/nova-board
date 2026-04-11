import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[key]/labels - list project labels
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key } = await params

  const project = await prisma.project.findFirst({
    where: { key, workspace: { members: { some: { userId: session.user.id } } } },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const labels = await prisma.projectLabel.findMany({
    where: { projectId: project.id },
  })
  return NextResponse.json(labels)
}

// POST /api/projects/[key]/labels - create project label
export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key } = await params

  const project = await prisma.project.findFirst({
    where: { key, workspace: { members: { some: { userId: session.user.id } } } },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { name, color } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const label = await prisma.projectLabel.create({
    data: { name, color: color || '#6366f1', projectId: project.id },
  })
  return NextResponse.json(label, { status: 201 })
}
