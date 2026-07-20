import express from 'express'
import Stripe from 'stripe'
import { authenticate } from '../middleware/auth.js'
import { successResponse, errorResponse } from '../utils/response.js'

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
})

router.post('/create-customer', authenticate, async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      email: req.user.email,
      name: req.user.name,
    })
    return res.json(successResponse('Stripe customer created.', { customer }))
  } catch (error) {
    return res.status(500).json(errorResponse('Stripe customer creation failed.', error.message))
  }
})

router.post('/create-checkout-session', authenticate, async (req, res) => {
  const { priceId, successUrl, cancelUrl } = req.body
  if (!priceId || !successUrl || !cancelUrl) {
    return res.status(400).json(errorResponse('Missing required fields.', 'priceId, successUrl, and cancelUrl are required.'))
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: req.user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return res.json(successResponse('Stripe checkout session created.', { sessionId: session.id, url: session.url }))
  } catch (error) {
    return res.status(500).json(errorResponse('Stripe checkout session creation failed.', error.message))
  }
})

export default router
