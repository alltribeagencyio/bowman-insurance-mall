import { apiClient } from './client'

export interface Asset {
  id: string
  user: string
  asset_type: 'vehicle' | 'property' | 'business' | 'other'
  name: string
  description?: string
  details: {
    // Vehicle details
    make?: string
    model?: string
    year?: number
    registration?: string
    chassis_number?: string
    engine_number?: string
    value?: number

    // Property details
    address?: string
    property_type?: string
    size?: string

    // Business details
    business_name?: string
    registration_number?: string
    industry?: string

    // Common
    purchase_date?: string
    current_value?: number
  }
  created_at: string
  updated_at: string
}

export interface CreateAssetInput {
  asset_type: 'vehicle' | 'property' | 'business' | 'other'
  name: string
  description?: string
  details: any
}

// Simple cache for assets
let assetsCache: { data: Asset[]; timestamp: number } | null = null
const CACHE_DURATION = 300000 // 5 minutes

// Get all user assets
export const getUserAssets = async (forceRefresh = false): Promise<Asset[]> => {
  // Check cache first
  if (!forceRefresh && assetsCache) {
    const now = Date.now()
    if (now - assetsCache.timestamp < CACHE_DURATION) {
      return assetsCache.data
    }
  }

  try {
    // Try to get from backend (when assets API is implemented)
    const response = await apiClient.get('/assets/')
    const data = response.data.results || response.data

    // Update cache
    assetsCache = {
      data: Array.isArray(data) ? data : [],
      timestamp: Date.now()
    }

    return assetsCache.data
  } catch (error) {
    // Fallback to localStorage if backend not ready
    const stored = localStorage.getItem('user_assets')
    const data = stored ? JSON.parse(stored) : []

    assetsCache = {
      data,
      timestamp: Date.now()
    }

    return data
  }
}

// Get user vehicles specifically
export const getUserVehicles = async (): Promise<Asset[]> => {
  const assets = await getUserAssets()
  return assets.filter(a => a.asset_type === 'vehicle')
}

// Create asset
export const createAsset = async (assetData: CreateAssetInput): Promise<Asset> => {
  try {
    // Try backend first
    const response = await apiClient.post('/assets/', assetData)
    clearAssetsCache()
    return response.data
  } catch (error) {
    // Fallback to localStorage
    const newAsset: Asset = {
      id: Date.now().toString(),
      user: 'current-user',
      ...assetData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const stored = localStorage.getItem('user_assets')
    const assets = stored ? JSON.parse(stored) : []
    assets.push(newAsset)
    localStorage.setItem('user_assets', JSON.stringify(assets))

    clearAssetsCache()
    return newAsset
  }
}

// Update asset
export const updateAsset = async (id: string, assetData: Partial<CreateAssetInput>): Promise<Asset> => {
  try {
    const response = await apiClient.patch(`/assets/${id}/`, assetData)
    clearAssetsCache()
    return response.data
  } catch (error) {
    // Fallback to localStorage
    const stored = localStorage.getItem('user_assets')
    const assets: Asset[] = stored ? JSON.parse(stored) : []
    const index = assets.findIndex(a => a.id === id)

    if (index !== -1) {
      assets[index] = {
        ...assets[index],
        ...assetData,
        updated_at: new Date().toISOString()
      }
      localStorage.setItem('user_assets', JSON.stringify(assets))
      clearAssetsCache()
      return assets[index]
    }

    throw new Error('Asset not found')
  }
}

// Delete asset
export const deleteAsset = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/assets/${id}/`)
    clearAssetsCache()
  } catch (error) {
    // Fallback to localStorage
    const stored = localStorage.getItem('user_assets')
    const assets: Asset[] = stored ? JSON.parse(stored) : []
    const filtered = assets.filter(a => a.id !== id)
    localStorage.setItem('user_assets', JSON.stringify(filtered))
    clearAssetsCache()
  }
}

// Clear assets cache
export const clearAssetsCache = () => {
  assetsCache = null
}
