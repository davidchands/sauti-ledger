import { Router } from 'express'
import { transcribeAudio } from '../lib/groq'

export const transcribeRouter = Router()

const MAX_AUDIO_BYTES = 15 * 1024 * 1024 // ~60s of audio comfortably fits well under this

transcribeRouter.post('/', async (req, res) => {
  const contentType = req.header('Content-Type')
  if (!contentType?.startsWith('audio/')) {
    res.status(400).json({ error: 'Expected an audio/* Content-Type' })
    return
  }

  const chunks: Buffer[] = []
  let totalBytes = 0
  let tooLarge = false

  req.on('data', (chunk: Buffer) => {
    totalBytes += chunk.length
    if (totalBytes > MAX_AUDIO_BYTES) {
      tooLarge = true
      req.destroy()
      return
    }
    chunks.push(chunk)
  })

  req.on('end', async () => {
    if (tooLarge) {
      res.status(413).json({ error: 'Audio too large' })
      return
    }
    if (chunks.length === 0) {
      res.status(400).json({ error: 'No audio received' })
      return
    }

    try {
      const audio = Buffer.concat(chunks)
      // Only set by the live-caption chunker, and only sw/en — see
      // server/lib/groq.ts for why. Never trusted beyond that allowlist.
      const languageHintRaw = req.header('X-Language-Hint')
      const languageHint =
        languageHintRaw === 'sw' || languageHintRaw === 'en' ? languageHintRaw : undefined
      const result = await transcribeAudio(audio, contentType, languageHint)
      res.json(result)
    } catch (error) {
      console.error('Transcription failed', error)
      res.status(502).json({ error: 'Transcription failed' })
    }
  })

  req.on('error', (error) => {
    console.error('Audio upload stream error', error)
    if (!res.headersSent) {
      res.status(400).json({ error: 'Upload failed' })
    }
  })
})
