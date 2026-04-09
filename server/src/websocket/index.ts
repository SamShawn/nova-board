import { WebSocketServer, WebSocket } from 'ws'
import type { Server } from 'http'
import jwt from 'jsonwebtoken'

interface WSClient {
  ws: WebSocket
  userId: string
  boardId?: string
}

const clients = new Map<WebSocket, WSClient>()

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws, req) => {
    // Extract token from query string
    const url = new URL(req.url || '', `http://${req.headers.host}`)
    const token = url.searchParams.get('token')

    if (!token) {
      ws.close(4001, 'Authentication required')
      return
    }

    try {
      const secret = process.env.JWT_SECRET || 'default-secret'
      const payload = jwt.verify(token, secret) as { userId: string }

      clients.set(ws, { ws, userId: payload.userId })

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          handleMessage(ws, message)
        } catch (err) {
          console.error('Invalid message:', err)
        }
      })

      ws.on('close', () => {
        const client = clients.get(ws)
        if (client?.boardId) {
          broadcastToBoard(client.boardId, {
            type: 'user-left',
            payload: { userId: client.userId },
            timestamp: new Date().toISOString(),
          })
        }
        clients.delete(ws)
      })

      ws.send(JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() }))
    } catch (err) {
      ws.close(4002, 'Invalid token')
    }
  })
}

function handleMessage(ws: WebSocket, message: { type: string; payload?: unknown }) {
  const client = clients.get(ws)
  if (!client) return

  switch (message.type) {
    case 'join-board': {
      const { boardId } = message.payload as { boardId: string }
      client.boardId = boardId
      broadcastToBoard(boardId, {
        type: 'user-joined',
        payload: { userId: client.userId },
        timestamp: new Date().toISOString(),
      })
      break
    }

    case 'leave-board': {
      if (client.boardId) {
        broadcastToBoard(client.boardId, {
          type: 'user-left',
          payload: { userId: client.userId },
          timestamp: new Date().toISOString(),
        })
        client.boardId = undefined
      }
      break
    }

    case 'issue-move': {
      if (client.boardId) {
        broadcastToBoard(client.boardId, {
          type: 'issue-moved',
          payload: message.payload,
          timestamp: new Date().toISOString(),
        }, ws)
      }
      break
    }

    default:
      console.log('Unknown message type:', message.type)
  }
}

function broadcastToBoard(
  boardId: string,
  message: { type: string; payload: unknown; timestamp: string },
  exclude?: WebSocket
) {
  const messageStr = JSON.stringify(message)

  clients.forEach((client) => {
    if (client.boardId === boardId && client.ws !== exclude && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr)
    }
  })
}
