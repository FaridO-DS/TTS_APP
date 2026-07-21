import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import stripeRoutes from './routes/stripe.js'
import historyRoutes from './routes/history.js'

dotenv.config()

const app = express()
const allowedOrigins = [process.env.FRONTEND_ORIGIN || 'http://localhost:5173']
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/stripe', stripeRoutes)
app.use('/history', historyRoutes)

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend service is running.',
    data: {
      version: '0.1.0',
      availableRoutes: [
        '/auth/register',
        '/auth/login',
        '/users/me',
        '/stripe/create-customer',
        '/stripe/create-checkout-session',
        '/history',
      ],
    },
    error: null,
  })
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`)
})
