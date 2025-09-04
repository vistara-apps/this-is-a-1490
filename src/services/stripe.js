import { loadStripe } from '@stripe/stripe-js'
import { config } from '../config'

// Initialize Stripe
let stripePromise
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(config.stripe.publishableKey)
  }
  return stripePromise
}

export const stripeService = {
  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(planId, userId, successUrl, cancelUrl) {
    try {
      const response = await fetch(`${config.app.apiUrl}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          successUrl: successUrl || `${config.app.url}/dashboard?success=true`,
          cancelUrl: cancelUrl || `${config.app.url}/dashboard?canceled=true`
        })
      })

      const session = await response.json()
      
      if (!response.ok) {
        throw new Error(session.error || 'Failed to create checkout session')
      }

      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw new Error('Failed to create checkout session')
    }
  },

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(sessionId) {
    try {
      const stripe = await getStripe()
      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error)
      throw new Error('Failed to redirect to checkout')
    }
  },

  /**
   * Create subscription checkout flow
   */
  async subscribeToplan(planId, userId) {
    try {
      // Create checkout session
      const session = await this.createCheckoutSession(planId, userId)
      
      // Redirect to Stripe Checkout
      await this.redirectToCheckout(session.id)
      
      return session
    } catch (error) {
      console.error('Error subscribing to plan:', error)
      throw new Error('Failed to subscribe to plan')
    }
  },

  /**
   * Get customer subscription status
   */
  async getSubscriptionStatus(customerId) {
    try {
      const response = await fetch(`${config.app.apiUrl}/subscription-status/${customerId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get subscription status')
      }

      return {
        status: data.status,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        plan: data.plan,
        customerId: data.customer_id
      }
    } catch (error) {
      console.error('Error getting subscription status:', error)
      throw new Error('Failed to get subscription status')
    }
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(`${config.app.apiUrl}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      return data
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw new Error('Failed to cancel subscription')
    }
  },

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, newPlanId) {
    try {
      const response = await fetch(`${config.app.apiUrl}/update-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          subscriptionId, 
          newPlanId 
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription')
      }

      return data
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw new Error('Failed to update subscription')
    }
  },

  /**
   * Create customer portal session
   */
  async createPortalSession(customerId, returnUrl) {
    try {
      const response = await fetch(`${config.app.apiUrl}/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: returnUrl || `${config.app.url}/dashboard`
        })
      })

      const session = await response.json()
      
      if (!response.ok) {
        throw new Error(session.error || 'Failed to create portal session')
      }

      return session
    } catch (error) {
      console.error('Error creating portal session:', error)
      throw new Error('Failed to create portal session')
    }
  },

  /**
   * Get usage-based pricing for current period
   */
  async getUsageMetrics(customerId) {
    try {
      const response = await fetch(`${config.app.apiUrl}/usage-metrics/${customerId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get usage metrics')
      }

      return {
        adGenerations: data.ad_generations,
        autoPosts: data.auto_posts,
        periodStart: data.period_start,
        periodEnd: data.period_end,
        limits: data.limits
      }
    } catch (error) {
      console.error('Error getting usage metrics:', error)
      throw new Error('Failed to get usage metrics')
    }
  },

  /**
   * Record usage for billing
   */
  async recordUsage(customerId, usageType, quantity = 1) {
    try {
      const response = await fetch(`${config.app.apiUrl}/record-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          usageType, // 'ad_generation' or 'auto_post'
          quantity
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to record usage')
      }

      return data
    } catch (error) {
      console.error('Error recording usage:', error)
      throw new Error('Failed to record usage')
    }
  },

  /**
   * Check if user can perform action based on plan limits
   */
  async checkUsageLimit(customerId, usageType) {
    try {
      const metrics = await this.getUsageMetrics(customerId)
      const currentUsage = metrics[usageType] || 0
      const limit = metrics.limits[usageType]

      return {
        canProceed: limit === -1 || currentUsage < limit, // -1 means unlimited
        currentUsage,
        limit,
        remaining: limit === -1 ? -1 : Math.max(0, limit - currentUsage)
      }
    } catch (error) {
      console.error('Error checking usage limit:', error)
      throw new Error('Failed to check usage limit')
    }
  },

  /**
   * Get available plans
   */
  getPlans() {
    return Object.values(config.plans).map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features,
      popular: plan.id === 'pro' // Mark pro as popular
    }))
  },

  /**
   * Format price for display
   */
  formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price)
  },

  /**
   * Handle webhook events (for backend integration)
   */
  async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          // Handle successful subscription
          console.log('Subscription created:', event.data.object)
          break
        
        case 'invoice.payment_succeeded':
          // Handle successful payment
          console.log('Payment succeeded:', event.data.object)
          break
        
        case 'invoice.payment_failed':
          // Handle failed payment
          console.log('Payment failed:', event.data.object)
          break
        
        case 'customer.subscription.updated':
          // Handle subscription changes
          console.log('Subscription updated:', event.data.object)
          break
        
        case 'customer.subscription.deleted':
          // Handle subscription cancellation
          console.log('Subscription canceled:', event.data.object)
          break
        
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
    } catch (error) {
      console.error('Error handling webhook event:', error)
      throw new Error('Failed to handle webhook event')
    }
  }
}

export default stripeService
