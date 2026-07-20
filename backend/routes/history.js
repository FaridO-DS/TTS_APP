import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { getHistoryForUser, createGenerationHistory } from '../services/historyService.js'
import { successResponse, errorResponse } from '../utils/response.js'

const router = express.Router()

router.get('/', authenticate, async (req, res) => {
  const history = await getHistoryForUser(req.user.id)
  return res.json(successResponse('User history retrieved successfully.', history))
})

router.post('/', authenticate, async (req, res) => {
  const { prompt, language, voice, durationSeconds, usageCredits, resultUrl } = req.body
  if (!prompt || !language || !voice) {
    return res.status(400).json(errorResponse('Missing required fields.', 'prompt, language, and voice are required.'))
  }

  try {
    const entry = await createGenerationHistory({
      userId: req.user.id,
      prompt,
      language,
      voice,
      durationSeconds: durationSeconds || 0,
      usageCredits: usageCredits || 0,
      resultUrl: resultUrl || null,
    })

    return res.json(successResponse('History entry created.', entry))
  } catch (error) {
    return res.status(500).json(errorResponse('Failed to save history entry.', error.message))
  }
})

export default router
