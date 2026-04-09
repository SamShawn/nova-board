import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma/client.js'
import { authenticate } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'

export const issuesRouter = Router()

const createIssueSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
})

const updateIssueSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
})

const moveIssueSchema = z.object({
  columnId: z.string(),
  order: z.number().int().min(0),
})

// Create an issue
issuesRouter.post('/columns/:columnId/issues', authenticate, async (req, res, next) => {
  try {
    const { title, description, priority, assigneeId, dueDate } = createIssueSchema.parse(req.body)

    const column = await prisma.column.findUnique({
      where: { id: req.params.columnId },
      include: { board: true },
    })

    if (!column) {
      throw new AppError(404, 'Column not found')
    }

    // Check permissions
    const member = await prisma.boardMember.findFirst({
      where: {
        boardId: column.boardId,
        userId: req.user!.id,
      },
    })

    if (!member || member.role === 'VIEWER') {
      throw new AppError(403, 'Insufficient permissions')
    }

    // Get the highest order
    const lastIssue = await prisma.issue.findFirst({
      where: { columnId: req.params.columnId },
      orderBy: { order: 'desc' },
    })

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        columnId: req.params.columnId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: (lastIssue?.order ?? -1) + 1,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        labels: true,
        subtasks: true,
        comments: true,
      },
    })

    res.status(201).json(issue)
  } catch (error) {
    next(error)
  }
})

// Update an issue
issuesRouter.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { title, description, priority, assigneeId, dueDate } = updateIssueSchema.parse(req.body)

    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: { column: true },
    })

    if (!issue) {
      throw new AppError(404, 'Issue not found')
    }

    // Check permissions
    const member = await prisma.boardMember.findFirst({
      where: {
        boardId: issue.column.boardId,
        userId: req.user!.id,
      },
    })

    if (!member || member.role === 'VIEWER') {
      throw new AppError(403, 'Insufficient permissions')
    }

    const updated = await prisma.issue.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        labels: true,
        subtasks: true,
        comments: true,
      },
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

// Move an issue to a different column or reorder within column
issuesRouter.patch('/:id/move', authenticate, async (req, res, next) => {
  try {
    const { columnId, order } = moveIssueSchema.parse(req.body)

    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: { column: true },
    })

    if (!issue) {
      throw new AppError(404, 'Issue not found')
    }

    // Check permissions
    const member = await prisma.boardMember.findFirst({
      where: {
        boardId: issue.column.boardId,
        userId: req.user!.id,
      },
    })

    if (!member || member.role === 'VIEWER') {
      throw new AppError(403, 'Insufficient permissions')
    }

    // If moving to a different column, reorder the target column
    if (columnId !== issue.columnId) {
      // Shift issues in target column
      await prisma.issue.updateMany({
        where: {
          columnId,
          order: { gte: order },
        },
        data: {
          order: { increment: 1 },
        },
      })
    }

    const updated = await prisma.issue.update({
      where: { id: req.params.id },
      data: {
        columnId,
        order,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        labels: true,
        subtasks: true,
        comments: true,
      },
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

// Delete an issue
issuesRouter.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: { column: true },
    })

    if (!issue) {
      throw new AppError(404, 'Issue not found')
    }

    // Check permissions
    const member = await prisma.boardMember.findFirst({
      where: {
        boardId: issue.column.boardId,
        userId: req.user!.id,
      },
    })

    if (!member || member.role === 'VIEWER') {
      throw new AppError(403, 'Insufficient permissions')
    }

    await prisma.issue.delete({ where: { id: req.params.id } })

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})
