import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { getUserById } from '../services/userService.js'
import { successResponse, errorResponse } from '../utils/response.js'

const router = express.Router()

router.get('/me', authenticate, async (req, res) => {
  const user = await getUserById(req.user.id)
  if (!user) {
    return res.status(404).json(errorResponse('User not found.', 'No user matches the token.'))
  }

  return res.json(successResponse('User profile retrieved successfully.', user))
})

export default router
