import { Router } from 'express'
import { z } from 'zod'
import { extractTransactions } from '../lib/gemini'

export const extractRouter = Router()

const requestSchema = z.object({
  transcript: z.string().trim().min(1).max(2000),
})

extractRouter.post('/', async (req, res) => {
  const parsed = requestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  try {
    const transactions = await extractTransactions(parsed.data.transcript)
    res.json({ transactions })
  } catch (error) {
    console.error('Extraction failed', error)
    res.status(502).json({ error: 'Extraction failed' })
  }
})
