-- AdSpark AI Database Schema for Supabase
-- This file contains all the SQL commands to set up the database schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('free', 'basic', 'pro', 'canceled', 'past_due');
CREATE TYPE posting_status AS ENUM ('pending', 'posting', 'posted', 'failed');
CREATE TYPE platform_type AS ENUM ('instagram', 'tiktok', 'facebook', 'twitter', 'farcaster');

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_status subscription_status DEFAULT 'free',
  stripe_customer_id TEXT,
  social_account_tokens JSONB DEFAULT '{}',
  usage_stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  project_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  product_image_ref TEXT NOT NULL, -- IPFS hash
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad variations table
CREATE TABLE ad_variations (
  ad_variation_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE NOT NULL,
  generated_image_ref TEXT, -- IPFS hash
  generated_text TEXT NOT NULL,
  platform_specific_format JSONB DEFAULT '{}',
  posted_to_platform_status posting_status DEFAULT 'pending',
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media posts table (for tracking posted ads)
CREATE TABLE social_posts (
  post_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_variation_id UUID REFERENCES ad_variations(ad_variation_id) ON DELETE CASCADE NOT NULL,
  platform platform_type NOT NULL,
  external_post_id TEXT, -- Platform-specific post ID
  post_url TEXT,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  performance_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE usage_records (
  usage_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  usage_type TEXT NOT NULL, -- 'ad_generation', 'auto_post', etc.
  quantity INTEGER DEFAULT 1,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans table (for reference)
CREATE TABLE subscription_plans (
  plan_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT DEFAULT 'month',
  features JSONB DEFAULT '{}',
  stripe_price_id TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE user_subscriptions (
  subscription_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES subscription_plans(plan_id),
  stripe_subscription_id TEXT UNIQUE,
  status subscription_status DEFAULT 'free',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics aggregation table
CREATE TABLE analytics_summary (
  summary_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_ads_generated INTEGER DEFAULT 0,
  total_ads_posted INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  avg_engagement_rate DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_ad_variations_project_id ON ad_variations(project_id);
CREATE INDEX idx_ad_variations_status ON ad_variations(posted_to_platform_status);
CREATE INDEX idx_social_posts_ad_variation_id ON social_posts(ad_variation_id);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX idx_usage_records_period ON usage_records(period_start, period_end);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_analytics_summary_user_id ON analytics_summary(user_id);
CREATE INDEX idx_analytics_summary_project_id ON analytics_summary(project_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_variations_updated_at BEFORE UPDATE ON ad_variations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_summary_updated_at BEFORE UPDATE ON analytics_summary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Ad variations policies
CREATE POLICY "Users can view own ad variations" ON ad_variations FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM projects WHERE project_id = ad_variations.project_id)
);
CREATE POLICY "Users can create ad variations for own projects" ON ad_variations FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM projects WHERE project_id = ad_variations.project_id)
);
CREATE POLICY "Users can update own ad variations" ON ad_variations FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM projects WHERE project_id = ad_variations.project_id)
);
CREATE POLICY "Users can delete own ad variations" ON ad_variations FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM projects WHERE project_id = ad_variations.project_id)
);

-- Social posts policies
CREATE POLICY "Users can view own social posts" ON social_posts FOR SELECT USING (
  auth.uid() IN (
    SELECT p.user_id FROM projects p 
    JOIN ad_variations av ON p.project_id = av.project_id 
    WHERE av.ad_variation_id = social_posts.ad_variation_id
  )
);
CREATE POLICY "Users can create social posts for own ads" ON social_posts FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT p.user_id FROM projects p 
    JOIN ad_variations av ON p.project_id = av.project_id 
    WHERE av.ad_variation_id = social_posts.ad_variation_id
  )
);
CREATE POLICY "Users can update own social posts" ON social_posts FOR UPDATE USING (
  auth.uid() IN (
    SELECT p.user_id FROM projects p 
    JOIN ad_variations av ON p.project_id = av.project_id 
    WHERE av.ad_variation_id = social_posts.ad_variation_id
  )
);

-- Usage records policies
CREATE POLICY "Users can view own usage records" ON usage_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own usage records" ON usage_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics summary policies
CREATE POLICY "Users can view own analytics" ON analytics_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own analytics" ON analytics_summary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON analytics_summary FOR UPDATE USING (auth.uid() = user_id);

-- Subscription plans are public (read-only)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans FOR SELECT USING (true);

-- Insert default subscription plans
INSERT INTO subscription_plans (plan_id, name, price_cents, currency, interval, features) VALUES
('free', 'Free', 0, 'USD', 'month', '{"adGenerations": 3, "autoPosts": 1, "platforms": ["farcaster"], "analytics": false, "support": "community"}'),
('basic', 'Basic', 2900, 'USD', 'month', '{"adGenerations": 50, "autoPosts": 10, "platforms": ["instagram", "tiktok", "farcaster"], "analytics": true, "support": "email"}'),
('pro', 'Pro', 7900, 'USD', 'month', '{"adGenerations": -1, "autoPosts": 50, "platforms": ["instagram", "tiktok", "facebook", "twitter", "farcaster"], "analytics": true, "support": "priority"}');

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_usage_stats(user_uuid UUID, usage_period_days INTEGER DEFAULT 30)
RETURNS TABLE (
  usage_type TEXT,
  total_usage BIGINT,
  period_start DATE,
  period_end DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.usage_type,
    SUM(ur.quantity) as total_usage,
    (CURRENT_DATE - usage_period_days)::DATE as period_start,
    CURRENT_DATE as period_end
  FROM usage_records ur
  WHERE ur.user_id = user_uuid
    AND ur.created_at >= (CURRENT_DATE - usage_period_days)
  GROUP BY ur.usage_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_project_analytics(project_uuid UUID)
RETURNS TABLE (
  total_ads INTEGER,
  posted_ads INTEGER,
  total_impressions BIGINT,
  total_engagement BIGINT,
  avg_engagement_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(av.ad_variation_id)::INTEGER as total_ads,
    COUNT(CASE WHEN av.posted_to_platform_status = 'posted' THEN 1 END)::INTEGER as posted_ads,
    COALESCE(SUM((av.performance_metrics->>'impressions')::INTEGER), 0) as total_impressions,
    COALESCE(SUM((av.performance_metrics->>'engagement')::INTEGER), 0) as total_engagement,
    CASE 
      WHEN SUM((av.performance_metrics->>'impressions')::INTEGER) > 0 
      THEN (SUM((av.performance_metrics->>'engagement')::INTEGER)::DECIMAL / SUM((av.performance_metrics->>'impressions')::INTEGER))
      ELSE 0 
    END as avg_engagement_rate
  FROM ad_variations av
  WHERE av.project_id = project_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, subscription_status, social_account_tokens, usage_stats)
  VALUES (
    NEW.id,
    'free',
    '{}',
    '{"adGenerations": 0, "autoPosts": 0, "periodStart": "' || CURRENT_DATE || '"}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
