import OpenAI from 'openai'
import { config } from '../config'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

export const openaiService = {
  /**
   * Generate ad copy variations for a product
   */
  async generateAdCopy(productDescription, platform = 'instagram', count = 3) {
    try {
      const prompt = `Create ${count} engaging social media ad copy variations for ${platform} for this product: ${productDescription}

Requirements:
- Keep each variation under 125 characters for ${platform}
- Use action-oriented language
- Include emotional triggers
- Make them platform-appropriate
- Focus on benefits, not just features
- Include relevant emojis where appropriate

Return as JSON array with format: [{"text": "ad copy here", "tone": "exciting|professional|casual", "cta": "call to action"}]`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media marketing copywriter specializing in high-converting ad copy. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })

      const content = response.choices[0].message.content
      return JSON.parse(content)
    } catch (error) {
      console.error('Error generating ad copy:', error)
      throw new Error('Failed to generate ad copy')
    }
  },

  /**
   * Generate image variations using DALL-E
   */
  async generateImageVariations(imageFile, count = 3) {
    try {
      // Convert file to base64 for API
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('n', count.toString())
      formData.append('size', '1024x1024')

      const response = await openai.images.createVariation({
        image: imageFile,
        n: count,
        size: '1024x1024'
      })

      return response.data.map((image, index) => ({
        id: `variation_${index}`,
        url: image.url,
        style: 'variation'
      }))
    } catch (error) {
      console.error('Error generating image variations:', error)
      throw new Error('Failed to generate image variations')
    }
  },

  /**
   * Generate styled ad creatives with backgrounds
   */
  async generateAdCreatives(productDescription, styles = ['modern', 'minimal', 'dynamic']) {
    try {
      const creatives = []

      for (const style of styles) {
        const prompt = `Create a ${style} social media ad background for: ${productDescription}

Style guidelines for ${style}:
${style === 'modern' ? '- Clean gradients, bold typography, contemporary colors' : ''}
${style === 'minimal' ? '- Simple, clean, lots of white space, subtle colors' : ''}
${style === 'dynamic' ? '- Energetic, vibrant colors, motion elements, bold shapes' : ''}

Requirements:
- 1080x1080 square format
- Leave space for product image overlay
- Professional quality
- Brand-safe colors
- High contrast for text readability`

        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd'
        })

        creatives.push({
          id: `${style}_${Date.now()}`,
          url: response.data[0].url,
          style,
          prompt
        })
      }

      return creatives
    } catch (error) {
      console.error('Error generating ad creatives:', error)
      throw new Error('Failed to generate ad creatives')
    }
  },

  /**
   * Analyze product image and extract description
   */
  async analyzeProductImage(imageUrl) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this product image and provide a detailed description including: product type, key features, target audience, and suggested marketing angles. Return as JSON with format: {"product": "name", "category": "category", "features": ["feature1", "feature2"], "target_audience": "description", "marketing_angles": ["angle1", "angle2"]}'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })

      const content = response.choices[0].message.content
      return JSON.parse(content)
    } catch (error) {
      console.error('Error analyzing product image:', error)
      throw new Error('Failed to analyze product image')
    }
  },

  /**
   * Generate platform-specific ad variations
   */
  async generatePlatformAds(productAnalysis, platforms = ['instagram', 'tiktok']) {
    try {
      const adVariations = []

      for (const platform of platforms) {
        // Generate copy for platform
        const copyVariations = await this.generateAdCopy(
          `${productAnalysis.product} - ${productAnalysis.features.join(', ')}`,
          platform,
          2
        )

        // Generate creative backgrounds
        const creatives = await this.generateAdCreatives(
          productAnalysis.product,
          ['modern', 'minimal']
        )

        // Combine copy and creatives
        copyVariations.forEach((copy, index) => {
          const creative = creatives[index % creatives.length]
          adVariations.push({
            id: `${platform}_${index}_${Date.now()}`,
            platform,
            text: copy.text,
            tone: copy.tone,
            cta: copy.cta,
            backgroundUrl: creative.url,
            style: creative.style,
            format: config.platforms[platform]?.formats?.post || { width: 1080, height: 1080 }
          })
        })
      }

      return adVariations
    } catch (error) {
      console.error('Error generating platform ads:', error)
      throw new Error('Failed to generate platform-specific ads')
    }
  },

  /**
   * Optimize ad copy for performance
   */
  async optimizeAdCopy(originalCopy, performanceData) {
    try {
      const prompt = `Optimize this ad copy based on performance data:

Original Copy: "${originalCopy}"
Performance Data: ${JSON.stringify(performanceData)}

Provide 3 optimized versions that address the performance issues. Consider:
- Click-through rate improvements
- Engagement optimization
- Conversion rate enhancement
- A/B testing variations

Return as JSON array with format: [{"text": "optimized copy", "optimization_focus": "ctr|engagement|conversion", "changes_made": "description of changes"}]`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a performance marketing expert specializing in ad copy optimization based on data insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })

      const content = response.choices[0].message.content
      return JSON.parse(content)
    } catch (error) {
      console.error('Error optimizing ad copy:', error)
      throw new Error('Failed to optimize ad copy')
    }
  }
}

export default openaiService
