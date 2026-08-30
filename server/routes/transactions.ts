import { Router } from 'express'
import { z } from 'zod'
import {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from '../../src/db/queries/transactions'
import type { AuthedRequest } from '../resolveUser'

export const transactionsRouter = Router()

const categoryEnum = z.enum(['Sales', 'Inventory', 'Rent', 'Operational', 'Other'])
const typeEnum = z.enum(['INCOME', 'EXPENSE'])

const createSchema = z.object({
  type: typeEnum,
  amount: z.number().int().positive(),
  category: categoryEnum,
  description: z.string().max(280).optional(),
})

const updateSchema = z.object({
  type: typeEnum.optional(),
  amount: z.number().int().positive().optional(),
  category: categoryEnum.optional(),
  description: z.string().max(280).optional(),
})

transactionsRouter.get('/', async (req, res) => {
  const { userId } = req as unknown as AuthedRequest
  const transactions = await listTransactions(userId)
  res.json(transactions)
})

transactionsRouter.post('/', async (req, res) => {
  const { userId } = req as unknown as AuthedRequest
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const created = await createTransaction({
    userId,
    source: 'MANUAL',
    ...parsed.data,
  })
  res.status(201).json(created)
})

transactionsRouter.get('/:id', async (req, res) => {
  const { userId } = req as unknown as AuthedRequest
  const transaction = await getTransaction(userId, req.params.id)
  if (!transaction) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json(transaction)
})

transactionsRouter.patch('/:id', async (req, res) => {
  const { userId } = req as unknown as AuthedRequest
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const updated = await updateTransaction(userId, req.params.id, parsed.data)
  if (!updated) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json(updated)
})

transactionsRouter.delete('/:id', async (req, res) => {
  const { userId } = req as unknown as AuthedRequest
  const deleted = await deleteTransaction(userId, req.params.id)
  if (!deleted) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.status(204).end()
})
