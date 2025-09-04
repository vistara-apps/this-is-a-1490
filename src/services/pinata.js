import axios from 'axios'
import { config } from '../config'

// Pinata API client
const pinataApi = axios.create({
  baseURL: config.pinata.baseUrl,
  headers: {
    'pinata_api_key': config.pinata.apiKey,
    'pinata_secret_api_key': config.pinata.secretKey
  }
})

export const pinataService = {
  /**
   * Upload file to IPFS via Pinata
   */
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Add metadata
      const pinataMetadata = {
        name: metadata.name || file.name,
        keyvalues: {
          type: metadata.type || 'product-image',
          uploadedAt: new Date().toISOString(),
          ...metadata.keyvalues
        }
      }
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata))

      // Add options
      const pinataOptions = {
        cidVersion: 1,
        wrapWithDirectory: false
      }
      formData.append('pinataOptions', JSON.stringify(pinataOptions))

      const response = await pinataApi.post('/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return {
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        metadata: pinataMetadata
      }
    } catch (error) {
      console.error('Error uploading to Pinata:', error)
      throw new Error('Failed to upload file to IPFS')
    }
  },

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(jsonData, metadata = {}) {
    try {
      const pinataMetadata = {
        name: metadata.name || 'json-data',
        keyvalues: {
          type: metadata.type || 'json-data',
          uploadedAt: new Date().toISOString(),
          ...metadata.keyvalues
        }
      }

      const pinataOptions = {
        cidVersion: 1
      }

      const data = {
        pinataContent: jsonData,
        pinataMetadata,
        pinataOptions
      }

      const response = await pinataApi.post('/pinning/pinJSONToIPFS', data)

      return {
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        metadata: pinataMetadata
      }
    } catch (error) {
      console.error('Error uploading JSON to Pinata:', error)
      throw new Error('Failed to upload JSON to IPFS')
    }
  },

  /**
   * Upload image from URL to IPFS
   */
  async uploadImageFromUrl(imageUrl, metadata = {}) {
    try {
      // Fetch the image
      const imageResponse = await fetch(imageUrl)
      const imageBlob = await imageResponse.blob()
      
      // Convert blob to file
      const file = new File([imageBlob], metadata.name || 'generated-image.png', {
        type: imageBlob.type
      })

      return await this.uploadFile(file, {
        ...metadata,
        type: 'generated-image'
      })
    } catch (error) {
      console.error('Error uploading image from URL:', error)
      throw new Error('Failed to upload image from URL to IPFS')
    }
  },

  /**
   * Get file info from IPFS hash
   */
  async getFileInfo(ipfsHash) {
    try {
      const response = await pinataApi.get(`/data/pinList?hashContains=${ipfsHash}`)
      
      if (response.data.rows.length === 0) {
        throw new Error('File not found')
      }

      const fileInfo = response.data.rows[0]
      return {
        ipfsHash: fileInfo.ipfs_pin_hash,
        pinSize: fileInfo.size,
        timestamp: fileInfo.date_pinned,
        metadata: fileInfo.metadata,
        url: `https://gateway.pinata.cloud/ipfs/${fileInfo.ipfs_pin_hash}`
      }
    } catch (error) {
      console.error('Error getting file info:', error)
      throw new Error('Failed to get file info from IPFS')
    }
  },

  /**
   * List all pinned files
   */
  async listFiles(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.pageLimit) params.append('pageLimit', filters.pageLimit)
      if (filters.pageOffset) params.append('pageOffset', filters.pageOffset)
      if (filters.metadata) {
        Object.entries(filters.metadata).forEach(([key, value]) => {
          params.append(`metadata[keyvalues][${key}]`, value)
        })
      }

      const response = await pinataApi.get(`/data/pinList?${params.toString()}`)
      
      return {
        files: response.data.rows.map(file => ({
          ipfsHash: file.ipfs_pin_hash,
          pinSize: file.size,
          timestamp: file.date_pinned,
          metadata: file.metadata,
          url: `https://gateway.pinata.cloud/ipfs/${file.ipfs_pin_hash}`
        })),
        count: response.data.count
      }
    } catch (error) {
      console.error('Error listing files:', error)
      throw new Error('Failed to list files from IPFS')
    }
  },

  /**
   * Unpin file from IPFS
   */
  async unpinFile(ipfsHash) {
    try {
      await pinataApi.delete(`/pinning/unpin/${ipfsHash}`)
      return { success: true, ipfsHash }
    } catch (error) {
      console.error('Error unpinning file:', error)
      throw new Error('Failed to unpin file from IPFS')
    }
  },

  /**
   * Test authentication
   */
  async testAuthentication() {
    try {
      const response = await pinataApi.get('/data/testAuthentication')
      return response.data
    } catch (error) {
      console.error('Pinata authentication failed:', error)
      throw new Error('Pinata authentication failed')
    }
  },

  /**
   * Upload ad variation data to IPFS
   */
  async uploadAdVariation(adData, productImageFile) {
    try {
      // Upload product image first
      const productImageUpload = await this.uploadFile(productImageFile, {
        name: `product-${Date.now()}.${productImageFile.name.split('.').pop()}`,
        type: 'product-image',
        keyvalues: {
          projectId: adData.projectId,
          adVariationId: adData.id
        }
      })

      // Upload generated images if they exist
      const generatedImageUploads = []
      if (adData.generatedImages) {
        for (const [index, imageUrl] of adData.generatedImages.entries()) {
          const upload = await this.uploadImageFromUrl(imageUrl, {
            name: `generated-${adData.id}-${index}.png`,
            type: 'generated-image',
            keyvalues: {
              projectId: adData.projectId,
              adVariationId: adData.id,
              style: adData.style,
              platform: adData.platform
            }
          })
          generatedImageUploads.push(upload)
        }
      }

      // Upload ad metadata
      const metadataUpload = await this.uploadJSON({
        id: adData.id,
        projectId: adData.projectId,
        text: adData.text,
        platform: adData.platform,
        style: adData.style,
        productImageRef: productImageUpload.ipfsHash,
        generatedImageRefs: generatedImageUploads.map(upload => upload.ipfsHash),
        createdAt: new Date().toISOString()
      }, {
        name: `ad-metadata-${adData.id}`,
        type: 'ad-metadata',
        keyvalues: {
          projectId: adData.projectId,
          adVariationId: adData.id
        }
      })

      return {
        productImage: productImageUpload,
        generatedImages: generatedImageUploads,
        metadata: metadataUpload
      }
    } catch (error) {
      console.error('Error uploading ad variation:', error)
      throw new Error('Failed to upload ad variation to IPFS')
    }
  }
}

export default pinataService
