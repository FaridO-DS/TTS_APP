import crypto from 'crypto'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getUserByEmail, createUser } from '../services/userService.js'
import { successResponse, errorResponse } from '../utils/response.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'
const TOKEN_EXPIRES_IN = '7d'

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password || !name) {
    return res.status(400).json(errorResponse('Missing required fields.', 'Email, password, and name are required.'))
  }

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return res.status(409).json(errorResponse('Email already registered.', 'Email exists.'))
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await createUser({ email, password: hashedPassword, name })
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })

  return res.json(successResponse('User registered successfully.', { token, user }))
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json(errorResponse('Missing required fields.', 'Email and password are required.'))
  }

  const user = await getUserByEmail(email)
  if (!user) {
    return res.status(401).json(errorResponse('Invalid credentials.', 'User not found.'))
  }

  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) {
    return res.status(401).json(errorResponse('Invalid credentials.', 'Password mismatch.'))
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
  return res.json(successResponse('Login successful.', { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }))
})

export default router
