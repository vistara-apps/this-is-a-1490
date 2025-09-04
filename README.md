# AdSpark AI - Generate & Deploy High-Performing Social Ads

AdSpark AI is a web application that uses artificial intelligence to create multiple social media ad variations from a single product image and facilitates their auto-posting and performance tracking.

## 🚀 Features

### Core Features
- **AI-Powered Ad Generation**: Upload a product image and generate 3-5 distinct ad variations with different backgrounds, text overlays, and stylized treatments
- **Platform-Specific Formatting**: Automatically formats ads for TikTok and Instagram Reels/Stories aspect ratios
- **Automated Social Media Posting**: Connect social media accounts to automatically post generated ad variations
- **Performance Tracking Integration**: Track impressions, clicks, and engagement metrics for posted ads

### Technical Features
- **Decentralized Storage**: IPFS integration via Pinata for immutable asset storage
- **Real-time Analytics**: Performance tracking and optimization insights
- **Subscription Management**: Tiered pricing with usage-based billing
- **Social Media Integration**: Farcaster integration for Web3 social posting

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for styling with custom design system
- **React Router** for navigation
- **React Dropzone** for file uploads
- **Lucide React** for icons

### Backend Services
- **Supabase** - Authentication, database, and real-time features
- **OpenAI API** - AI-powered image generation and text creation
- **Stripe** - Payment processing and subscription management
- **Pinata** - IPFS storage for decentralized file hosting
- **Neynar API** - Farcaster social media integration

### Database
- **PostgreSQL** (via Supabase) with Row Level Security
- **Real-time subscriptions** for live updates
- **Comprehensive analytics** tracking

## 📋 Prerequisites

Before setting up the project, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- OpenAI API key
- Stripe account (for payments)
- Pinata account (for IPFS storage)
- Neynar API key (for Farcaster integration)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/this-is-a-1490.git
cd this-is-a-1490
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your actual API keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Farcaster/Neynar Configuration
VITE_NEYNAR_API_KEY=your-neynar-api-key

# Pinata Configuration
VITE_PINATA_API_KEY=your-pinata-api-key
VITE_PINATA_SECRET_KEY=your-pinata-secret-key
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the database schema from `database/schema.sql` in your Supabase SQL editor
3. Enable Row Level Security (RLS) policies

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Run the SQL schema from `database/schema.sql`
4. Configure authentication providers if needed

### OpenAI Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com)
2. Ensure you have access to GPT-4 and DALL-E 3
3. Set up billing and usage limits

### Stripe Setup

1. Create a Stripe account
2. Get your publishable and secret keys
3. Set up webhook endpoints for subscription events
4. Configure products and pricing

### Pinata Setup

1. Create account at [Pinata](https://pinata.cloud)
2. Generate API keys
3. Configure IPFS gateway settings

### Neynar Setup

1. Get API key from [Neynar](https://neynar.com)
2. Configure Farcaster app settings
3. Set up webhook endpoints for cast events

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── AdVariantCard.jsx
│   ├── Auth.jsx
│   ├── Dashboard.jsx
│   ├── Header.jsx
│   ├── PerformanceMetrics.jsx
│   ├── PricingModal.jsx
│   ├── ProgressTabs.jsx
│   ├── Sidebar.jsx
│   └── UploadZone.jsx
├── contexts/           # React contexts
│   ├── AuthContext.jsx
│   └── ProjectContext.jsx
├── services/           # API services
│   ├── api.js         # Main API orchestrator
│   ├── farcaster.js   # Farcaster/Neynar integration
│   ├── openai.js      # OpenAI API integration
│   ├── pinata.js      # IPFS/Pinata integration
│   ├── stripe.js      # Stripe payment integration
│   └── supabase.js    # Supabase database operations
├── config/            # Configuration
│   └── index.js       # App configuration
├── App.jsx            # Main app component
├── main.jsx          # App entry point
└── index.css         # Global styles
```

## 🎨 Design System

The application uses a custom design system built with Tailwind CSS:

### Colors
- **Background**: `hsl(210 30% 98%)`
- **Text**: `hsl(210 20% 20%)`
- **Accent**: `hsl(40 90% 55%)`
- **Primary**: `hsl(240 80% 50%)`
- **Surface**: `hsl(0 0% 100%)`

### Components
- **Glass Effect**: Backdrop blur with transparency
- **Gradient Backgrounds**: Purple to blue gradients
- **Responsive Grid**: 12-column fluid grid system
- **Custom Buttons**: Primary and secondary button styles

## 💳 Subscription Plans

### Free Tier
- 3 ad generations per month
- 1 auto-post per month
- Farcaster platform only
- Community support

### Basic Plan ($29/month)
- 50 ad generations per month
- 10 auto-posts per month
- Instagram, TikTok, Farcaster
- Email support
- Analytics dashboard

### Pro Plan ($79/month)
- Unlimited ad generations
- 50 auto-posts per month
- All platforms
- Priority support
- Advanced analytics

## 🔒 Security

- **Row Level Security (RLS)** on all database tables
- **JWT-based authentication** via Supabase
- **API key management** through environment variables
- **CORS protection** for API endpoints
- **Input validation** for all user inputs

## 📊 Analytics

The application tracks:
- Ad generation usage
- Social media posting metrics
- Engagement rates and performance
- User subscription status
- Platform-specific analytics

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy the dist folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication
All API calls require authentication via Supabase JWT tokens.

### Rate Limits
- OpenAI API: Varies by plan
- Neynar API: 1000 requests/hour
- Pinata API: 1000 requests/month (free tier)

### Error Handling
All services implement comprehensive error handling with user-friendly messages.

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key validity
   - Verify billing setup
   - Check rate limits

2. **Supabase Connection Issues**
   - Verify URL and anon key
   - Check RLS policies
   - Ensure database schema is applied

3. **File Upload Issues**
   - Check file size limits (10MB max)
   - Verify supported formats (PNG, JPG, WebP, GIF)
   - Check Pinata API credentials

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Supabase for backend infrastructure
- Stripe for payment processing
- Pinata for decentralized storage
- Neynar for Farcaster integration

## 📞 Support

For support, email support@adspark.ai or join our Discord community.

---

Built with ❤️ by the AdSpark AI team
