import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[slug]/labels
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params

  const workspace = await prisma.workspace.findFirst({
    where: { slug, members: { some: { userId: session.user.id } } },
  })
  if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const labels = await prisma.workspaceLabel.findMany({
    where: { workspaceId: workspace.id },
  })
  return NextResponse.json(labels)
}

// POST /api/workspaces/[slug]/labels
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params

  const member = await prisma.workspaceMember.findFirst({
    where: { workspace: { slug }, userId: session.user.id, role: { in: ['ADMIN', 'MEMBER'] } },
  })
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, color } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const workspace = await prisma.workspace.findUnique({ where: { slug } })
  if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const label = await prisma.workspaceLabel.create({
    data: { name, color: color || '#6366f1', workspaceId: workspace.id },
  })
  return NextResponse.json(label, { status: 201 })
}
