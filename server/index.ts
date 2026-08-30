import 'dotenv/config'
import express from 'express'
import { resolveUser } from './resolveUser'
import { transactionsRouter } from './routes/transactions'

const app = express()
const port = process.env.API_PORT ?? 8787

app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/transactions', resolveUser, transactionsRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
