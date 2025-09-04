# AdSpark AI Deployment Guide

This guide covers the complete deployment process for AdSpark AI, including all external service configurations and production setup.

## 🚀 Production Deployment Checklist

### Prerequisites
- [ ] Domain name registered
- [ ] SSL certificate configured
- [ ] All API keys obtained
- [ ] Database schema deployed
- [ ] Environment variables configured

## 🔧 Service Configuration

### 1. Supabase Setup

#### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users
3. Set a strong database password

#### Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the entire content from `database/schema.sql`
3. Execute the script to create all tables, functions, and policies

#### Authentication Configuration
1. Go to Authentication > Settings
2. Configure Site URL: `https://yourdomain.com`
3. Add redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:5173/auth/callback` (for development)

#### API Keys
1. Go to Settings > API
2. Copy the Project URL and anon/public key
3. Keep the service_role key secure (for backend operations)

### 2. OpenAI Setup

#### API Key
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Create an API key with appropriate permissions
3. Set up billing and usage limits
4. Test the key with a simple API call

#### Model Access
Ensure you have access to:
- GPT-4 (for text generation)
- DALL-E 3 (for image generation)
- GPT-4 Vision (for image analysis)

### 3. Stripe Configuration

#### Account Setup
1. Create a Stripe account
2. Complete business verification
3. Get publishable and secret keys

#### Products and Pricing
1. Create products for each subscription tier:
   - Basic Plan: $29/month
   - Pro Plan: $79/month
2. Set up recurring billing
3. Configure usage-based billing for overages

#### Webhooks
Set up webhook endpoints for:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Webhook URL: `https://yourdomain.com/api/webhooks/stripe`

### 4. Pinata (IPFS) Setup

#### Account Creation
1. Create account at [Pinata](https://pinata.cloud)
2. Verify email and complete setup
3. Generate API keys

#### Configuration
1. Set up dedicated gateway (optional)
2. Configure file size limits
3. Set up automatic pinning rules

### 5. Neynar (Farcaster) Setup

#### API Access
1. Get API key from [Neynar](https://neynar.com)
2. Set up webhook endpoints for cast events
3. Configure rate limiting

#### Farcaster App
1. Create a Farcaster app
2. Configure app permissions
3. Set up signer management

## 🌐 Frontend Deployment

### Vercel Deployment (Recommended)

#### Setup
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### Environment Variables
Configure in Vercel dashboard:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-your-openai-api-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
VITE_NEYNAR_API_KEY=your-neynar-api-key
VITE_PINATA_API_KEY=your-pinata-api-key
VITE_PINATA_SECRET_KEY=your-pinata-secret-key
VITE_APP_URL=https://yourdomain.com
```

#### Domain Configuration
1. Add custom domain in Vercel
2. Configure DNS records
3. Enable automatic HTTPS

### Alternative: Netlify Deployment

#### Setup
1. Connect repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Environment Variables
Add the same environment variables as Vercel

## 🔒 Backend API (Optional)

If you need server-side functionality for Stripe webhooks or OpenAI proxy:

### Node.js Backend Setup

Create a simple Express.js server:

```javascript
// server.js
const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const app = express()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Stripe webhook handler
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful subscription
      break
    case 'invoice.payment_succeeded':
      // Handle successful payment
      break
    // Add other event handlers
  }

  res.json({received: true})
})

app.listen(3001)
```

### Deploy Backend
Deploy to:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

## 🔐 Security Configuration

### Environment Variables
Never commit API keys to version control:

```bash
# .env (never commit this file)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
# ... other keys
```

### CORS Configuration
Configure CORS in Supabase for your domain:
1. Go to Settings > API
2. Add your domain to CORS origins

### Rate Limiting
Implement rate limiting for:
- API endpoints
- File uploads
- AI generation requests

## 📊 Monitoring and Analytics

### Error Tracking
Set up error tracking with:
- Sentry
- LogRocket
- Bugsnag

### Performance Monitoring
Monitor with:
- Vercel Analytics
- Google Analytics
- PostHog

### Uptime Monitoring
Use services like:
- Pingdom
- UptimeRobot
- StatusPage

## 🚀 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🧪 Testing in Production

### Smoke Tests
Test critical paths:
- [ ] User registration
- [ ] Image upload
- [ ] Ad generation
- [ ] Social media posting
- [ ] Payment processing

### Load Testing
Use tools like:
- Artillery
- k6
- Apache Bench

## 📈 Scaling Considerations

### Database Scaling
- Enable connection pooling
- Set up read replicas
- Implement database indexing

### CDN Configuration
- Use Vercel's global CDN
- Configure caching headers
- Optimize image delivery

### API Rate Limiting
- Implement per-user rate limits
- Set up API quotas
- Monitor usage patterns

## 🔄 Backup and Recovery

### Database Backups
- Enable automatic backups in Supabase
- Set up point-in-time recovery
- Test backup restoration

### File Storage Backups
- IPFS provides natural redundancy
- Consider additional backup strategies
- Monitor pin status

## 📋 Launch Checklist

### Pre-Launch
- [ ] All services configured
- [ ] Database schema deployed
- [ ] Environment variables set
- [ ] SSL certificates active
- [ ] Error tracking configured
- [ ] Analytics implemented
- [ ] Payment processing tested
- [ ] Social media integration tested

### Launch Day
- [ ] Deploy to production
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check payment flows
- [ ] Verify social media posting
- [ ] Monitor performance metrics

### Post-Launch
- [ ] Monitor user feedback
- [ ] Track conversion rates
- [ ] Analyze usage patterns
- [ ] Plan feature iterations
- [ ] Scale infrastructure as needed

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

#### API Connection Issues
- Verify environment variables
- Check CORS configuration
- Test API endpoints individually

#### Payment Issues
- Verify Stripe webhook configuration
- Check webhook signatures
- Monitor Stripe dashboard for errors

#### File Upload Issues
- Check Pinata API limits
- Verify file size restrictions
- Test IPFS gateway access

## 📞 Support

For deployment support:
- Check the troubleshooting section
- Review service documentation
- Contact support teams for each service
- Join the community Discord

---

This deployment guide ensures a production-ready AdSpark AI application with all services properly configured and monitored.
