import crypto from 'crypto'
import { query } from './db.js'

export const getUserByEmail = async (email) => {
  const result = await query('SELECT id, email, name, role, password, consumption_quota, preferences, created_at, updated_at FROM users WHERE email = $1', [email])
  return result.rows[0]
}

export const getUserById = async (id) => {
  const result = await query('SELECT id, email, name, role, consumption_quota, preferences, created_at, updated_at FROM users WHERE id = $1', [id])
  return result.rows[0]
}

export const createUser = async ({ email, password, name }) => {
  const result = await query(
    'INSERT INTO users (id, email, password, name) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, consumption_quota, preferences, created_at, updated_at',
    [crypto.randomUUID(), email, password, name]
  )
  return result.rows[0]
}

export const updateUserPreferences = async (id, preferences) => {
  const result = await query(
    'UPDATE users SET preferences = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role, consumption_quota, preferences, created_at, updated_at',
    [preferences, id]
  )
  return result.rows[0]
}
