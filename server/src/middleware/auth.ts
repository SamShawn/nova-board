import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma/client.js'
import { AppError } from './errorHandler.js'

export interface AuthUser {
  id: string
  email: string
  name: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required')
    }

    const token = authHeader.slice(7)
    const secret = process.env.JWT_SECRET || 'default-secret'

    const payload = jwt.verify(token, secret) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      throw new AppError(401, 'User not found')
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token'))
    } else {
      next(error)
    }
  }
}
