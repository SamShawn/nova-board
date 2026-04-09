import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma/client.js'
import { authenticate } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'

export const boardsRouter = Router()

const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

// List all boards for the current user
boardsRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const boards = await prisma.board.findMany({
      where: {
        members: {
          some: { userId: req.user!.id },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(boards)
  } catch (error) {
    next(error)
  }
})

// Get a single board with all columns and issues
boardsRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const board = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        members: { some: { userId: req.user!.id } },
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            issues: {
              orderBy: { order: 'asc' },
              include: {
                assignee: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
                labels: true,
                subtasks: true,
                comments: {
                  include: {
                    author: { select: { id: true, name: true, avatar: true } },
                  },
                },
              },
            },
          },
        },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        labels: true,
      },
    })

    if (!board) {
      throw new AppError(404, 'Board not found')
    }

    res.json(board)
  } catch (error) {
    next(error)
  }
})

// Create a new board
boardsRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description } = createBoardSchema.parse(req.body)

    const board = await prisma.board.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: req.user!.id,
            role: 'OWNER',
          },
        },
        columns: {
          create: [
            { name: 'To Do', order: 0 },
            { name: 'In Progress', order: 1 },
            { name: 'Done', order: 2 },
          ],
        },
      },
      include: {
        columns: true,
        members: true,
      },
    })

    res.status(201).json(board)
  } catch (error) {
    next(error)
  }
})

// Update a board
boardsRouter.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const board = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        members: { some: { userId: req.user!.id, role: { in: ['OWNER', 'ADMIN'] } } },
      },
    })

    if (!board) {
      throw new AppError(404, 'Board not found')
    }

    const { name, description } = req.body

    const updated = await prisma.board.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

// Delete a board
boardsRouter.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const board = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        members: { some: { userId: req.user!.id, role: 'OWNER' } },
      },
    })

    if (!board) {
      throw new AppError(404, 'Board not found or insufficient permissions')
    }

    await prisma.board.delete({ where: { id: req.params.id } })

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Add member to board
boardsRouter.post('/:id/members', authenticate, async (req, res, next) => {
  try {
    const { userId, role = 'MEMBER' } = req.body

    const board = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        members: { some: { userId: req.user!.id, role: { in: ['OWNER', 'ADMIN'] } } },
      },
    })

    if (!board) {
      throw new AppError(404, 'Board not found')
    }

    const member = await prisma.boardMember.create({
      data: { boardId: req.params.id, userId, role },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    })

    res.status(201).json(member)
  } catch (error) {
    next(error)
  }
})
