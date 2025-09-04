// Application Configuration
export const config = {
  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
  },

  // OpenAI
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'sk-your-openai-api-key'
  },

  // Stripe
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your-stripe-publishable-key'
  },

  // Neynar (Farcaster)
  neynar: {
    apiKey: import.meta.env.VITE_NEYNAR_API_KEY || 'your-neynar-api-key',
    baseUrl: 'https://api.neynar.com/v1'
  },

  // Pinata (IPFS)
  pinata: {
    apiKey: import.meta.env.VITE_PINATA_API_KEY || 'your-pinata-api-key',
    secretKey: import.meta.env.VITE_PINATA_SECRET_KEY || 'your-pinata-secret-key',
    baseUrl: 'https://api.pinata.cloud'
  },

  // App
  app: {
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    name: 'AdSpark AI',
    description: 'Generate & Deploy High-Performing Social Ads in Minutes'
  },

  // Subscription Plans
  plans: {
    basic: {
      id: 'basic',
      name: 'Basic',
      price: 29,
      currency: 'USD',
      interval: 'month',
      features: {
        adGenerations: 50,
        autoPosts: 10,
        platforms: ['instagram', 'tiktok'],
        analytics: true,
        support: 'email'
      }
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: 79,
      currency: 'USD',
      interval: 'month',
      features: {
        adGenerations: -1, // unlimited
        autoPosts: 50,
        platforms: ['instagram', 'tiktok', 'facebook', 'twitter'],
        analytics: true,
        support: 'priority'
      }
    }
  },

  // AI Generation Settings
  ai: {
    maxVariations: 5,
    supportedFormats: ['instagram-story', 'instagram-post', 'tiktok-video', 'facebook-post'],
    imageFormats: ['png', 'jpg', 'jpeg', 'webp'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    generationTimeout: 30000 // 30 seconds
  },

  // Social Media Platform Settings
  platforms: {
    instagram: {
      name: 'Instagram',
      formats: {
        story: { width: 1080, height: 1920 },
        post: { width: 1080, height: 1080 },
        reel: { width: 1080, height: 1920 }
      }
    },
    tiktok: {
      name: 'TikTok',
      formats: {
        video: { width: 1080, height: 1920 }
      }
    },
    facebook: {
      name: 'Facebook',
      formats: {
        post: { width: 1200, height: 630 },
        story: { width: 1080, height: 1920 }
      }
    }
  }
}

export default config
