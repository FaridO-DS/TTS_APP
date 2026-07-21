import crypto from 'crypto'
import { query } from './db.js'

export const getHistoryForUser = async (userId) => {
  const result = await query('SELECT id, user_id, action, details, created_at FROM generations WHERE user_id = $1 ORDER BY created_at DESC', [userId])
  return result.rows
}

export const createGenerationHistory = async ({ userId, prompt, language, voice, durationSeconds, usageCredits, resultUrl }) => {
  const result = await query(
    `INSERT INTO generations (id, user_id, prompt, language, voice, duration_seconds, usage_credits, result_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, user_id, prompt, language, voice, duration_seconds, usage_credits, result_url, created_at`,
    [crypto.randomUUID(), userId, prompt, language, voice, durationSeconds, usageCredits, resultUrl]
  )
  return result.rows[0]
}
