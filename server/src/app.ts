import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { authRouter } from './routes/auth.js'
import { boardsRouter } from './routes/boards.js'
import { columnsRouter } from './routes/columns.js'
import { issuesRouter } from './routes/issues.js'
import { labelsRouter } from './routes/labels.js'
import { errorHandler } from './middleware/errorHandler.js'
import { setupWebSocket } from './websocket/index.js'

const app = express()
const server = createServer(app)

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRouter)
app.use('/api/boards', boardsRouter)
app.use('/api/columns', columnsRouter)
app.use('/api/issues', issuesRouter)
app.use('/api/labels', labelsRouter)

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler
app.use(errorHandler)

// WebSocket
setupWebSocket(server)

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
