import jwt from 'jsonwebtoken'
import { errorResponse } from '../utils/response.js'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(errorResponse('Authentication required.', 'No token provided.'))
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json(errorResponse('Invalid or expired token.', error.message))
  }
}
