import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma/client.js'
import { authenticate } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'

export const labelsRouter = Router()

const createLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

// List labels for a board
labelsRouter.get('/boards/:boardId/labels', authenticate, async (req, res, next) => {
  try {
    const board = await prisma.board.findFirst({
      where: {
        id: req.params.boardId,
        members: { some: { userId: req.user!.id } },
      },
    })

    if (!board) {
      throw new AppError(404, 'Board not found')
    }

    const labels = await prisma.label.findMany({
      where: { boardId: req.params.boardId },
    })

    res.json(labels)
  } catch (error) {
    next(error)
  }
})

// Create a label
labelsRouter.post('/boards/:boardId/labels', authenticate, async (req, res, next) => {
  try {
    const { name, color } = createLabelSchema.parse(req.body)

    const board = await prisma.board.findFirst({
      where: {
        id: req.params.boardId,
        members: { some: { userId: req.user!.id } },
      },
    })

    if (!board) {
      throw new AppError(404, 'Board not found')
    }

    const label = await prisma.label.create({
      data: {
        name,
        color,
        boardId: req.params.boardId,
      },
    })

    res.status(201).json(label)
  } catch (error) {
    next(error)
  }
})
