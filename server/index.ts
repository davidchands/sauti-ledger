import 'dotenv/config'
import express from 'express'
import { resolveUser } from './resolveUser'
import { transactionsRouter } from './routes/transactions'
import { transcribeRouter } from './routes/transcribe'

const app = express()
const port = process.env.API_PORT ?? 8787

app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/transactions', resolveUser, transactionsRouter)
app.use('/api/transcribe', resolveUser, transcribeRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // express.json() throws a SyntaxError with a `status` for malformed
  // request bodies — that's a client error (400), not a server error.
  if (err instanceof SyntaxError && 'status' in err) {
    res.status(400).json({ error: 'Malformed request body' })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
