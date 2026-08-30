import type { Request, Response, NextFunction } from 'express'
import { getOrCreateUserByDeviceId } from '../src/db/queries/users'

export interface AuthedRequest extends Request {
  userId: string
}

/**
 * MVP identity resolution (AGENTS.md § 3a). Resolves X-Device-Id to a
 * users row — the one place this app decides "who is making this
 * request." Every route handler downstream trusts req.userId, never
 * anything from the request body/query.
 */
export async function resolveUser(req: Request, res: Response, next: NextFunction) {
  const deviceId = req.header('X-Device-Id')
  if (!deviceId) {
    res.status(401).json({ error: 'Missing X-Device-Id header' })
    return
  }

  try {
    const user = await getOrCreateUserByDeviceId(deviceId)
    ;(req as AuthedRequest).userId = user.id
    next()
  } catch (error) {
    console.error('Failed to resolve user from device id', error)
    res.status(500).json({ error: 'Could not resolve user' })
  }
}
