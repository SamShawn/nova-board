import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../prisma/client.js'
import { AppError } from '../middleware/errorHandler.js'
import { authenticate } from '../middleware/auth.js'

export const authRouter = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'default-secret'
  return jwt.sign({ userId }, secret, { expiresIn: '7d' })
}

// Register
authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new AppError(400, 'Email already registered')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    })

    const token = generateToken(user.id)

    res.status(201).json({ user, token })
  } catch (error) {
    next(error)
  }
})

// Login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new AppError(401, 'Invalid email or password')
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new AppError(401, 'Invalid email or password')
    }

    const token = generateToken(user.id)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    })
  } catch (error) {
    next(error)
  }
})

// Get current user
authRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
})
