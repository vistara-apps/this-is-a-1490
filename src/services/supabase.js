import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

// Initialize Supabase client
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
)

// Database schema operations
export const supabaseService = {
  // User operations
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) throw error
    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Project operations
  async createProject(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        user_id: projectData.userId,
        product_image_ref: projectData.productImageRef,
        name: projectData.name,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getProjects(userId) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        ad_variations (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getProject(projectId) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        ad_variations (*)
      `)
      .eq('project_id', projectId)
      .single()

    if (error) throw error
    return data
  },

  // Ad variation operations
  async createAdVariation(variationData) {
    const { data, error } = await supabase
      .from('ad_variations')
      .insert([{
        project_id: variationData.projectId,
        generated_image_ref: variationData.generatedImageRef,
        generated_text: variationData.generatedText,
        platform_specific_format: variationData.platformSpecificFormat,
        posted_to_platform_status: variationData.postedToPlatformStatus || 'pending',
        performance_metrics: variationData.performanceMetrics || {}
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateAdVariation(variationId, updates) {
    const { data, error } = await supabase
      .from('ad_variations')
      .update(updates)
      .eq('ad_variation_id', variationId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAdVariations(projectId) {
    const { data, error } = await supabase
      .from('ad_variations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // User profile operations
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        subscription_status: profileData.subscriptionStatus,
        social_account_tokens: profileData.socialAccountTokens,
        usage_stats: profileData.usageStats,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Real-time subscriptions
  subscribeToProjects(userId, callback) {
    return supabase
      .channel('projects')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  subscribeToAdVariations(projectId, callback) {
    return supabase
      .channel('ad_variations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ad_variations',
        filter: `project_id=eq.${projectId}`
      }, callback)
      .subscribe()
  }
}

export default supabaseService
