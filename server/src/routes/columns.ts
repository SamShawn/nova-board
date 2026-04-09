import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma/client.js'
import { authenticate } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'

export const columnsRouter = Router()

const createColumnSchema = z.object({
  name: z.string().min(1).max(100),
})

const updateColumnSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  order: z.number().int().min(0).optional(),
})

// Create a column
columnsRouter.post('/boards/:boardId/columns', authenticate, async (req, res, next) => {
  try {
    const { name } = createColumnSchema.parse(req.body)

    const board = await prisma.board.findFirst({
      where: {
        id: req.params.boardId,
        members: { some: { userId: req.user!.id } },
      },
    })

    if (!board) {
      throw new AppError(404, 'Board not found')
    }

    // Get the highest order
    const lastColumn = await prisma.column.findFirst({
      where: { boardId: req.params.boardId },
      orderBy: { order: 'desc' },
    })

    const column = await prisma.column.create({
      data: {
        name,
        boardId: req.params.boardId,
        order: (lastColumn?.order ?? -1) + 1,
      },
    })

    res.status(201).json(column)
  } catch (error) {
    next(error)
  }
})

// Update a column
columnsRouter.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { name, order } = updateColumnSchema.parse(req.body)

    const column = await prisma.column.findUnique({
      where: { id: req.params.id },
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

    const updated = await prisma.column.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(order !== undefined && { order }),
      },
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

// Delete a column
columnsRouter.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const column = await prisma.column.findUnique({
      where: { id: req.params.id },
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

    await prisma.column.delete({ where: { id: req.params.id } })

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Reorder columns
columnsRouter.post('/boards/:boardId/columns/reorder', authenticate, async (req, res, next) => {
  try {
    const { columnIds } = req.body

    const board = await prisma.board.findFirst({
      where: {
        id: req.params.boardId,
        members: { some: { userId: req.user!.id } },
      },
    })

    if (!board) {
      throw new AppError(404, 'Board not found')
    }

    // Update all columns with new orders
    await prisma.$transaction(
      columnIds.map((id: string, index: number) =>
        prisma.column.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    const columns = await prisma.column.findMany({
      where: { boardId: req.params.boardId },
      orderBy: { order: 'asc' },
    })

    res.json(columns)
  } catch (error) {
    next(error)
  }
})
