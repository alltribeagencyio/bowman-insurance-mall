import { apiClient } from './client'
import { cacheManager } from '@/lib/cache/cache-manager'

export interface PolicyCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  policy_count: number
  display_order: number
}

export interface InsuranceCompany {
  id: string
  name: string
  logo?: string
  rating?: number
  description?: string
  contact_email: string
  contact_phone: string
  website?: string
  is_active: boolean
}

export interface PolicyType {
  id: string
  name: string
  slug: string
  description: string
  category_name: string
  company_name: string
  company_logo?: string
  company_rating?: string
  base_premium: string
  min_coverage_amount?: string
  max_coverage_amount?: string
  features: string[]
  status: string
  is_featured: boolean
}

export interface PolicyTypeDetail {
  id: string
  name: string
  slug: string
  description: string
  category: {
    id: string
    name: string
    slug: string
    description: string
    icon: string
    policy_count: number
  }
  insurance_company: {
    id: string
    name: string
    logo?: string
    rating?: number
    description?: string
    contact_email: string
    contact_phone: string
    website?: string
    is_active: boolean
  }
  base_premium: string
  coverage_details?: any
  features: string[]
  exclusions: string[]
  requirements?: any
  terms_and_conditions?: string
  min_coverage_amount?: string
  max_coverage_amount?: string
  min_age?: number
  max_age?: number
  status: string
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface PolicyReview {
  id: string
  user: {
    id: string
    name: string
  }
  policy_type: string
  rating: number
  review: string
  created_at: string
}

export interface PolicyTypeFilters {
  category?: string
  min_price?: number
  max_price?: number
  company?: string
  featured?: boolean
  search?: string
}

// Get all policy categories (cached for 10 minutes)
export const getCategories = async (): Promise<PolicyCategory[]> => {
  const cacheKey = '/policies/categories/'

  // Check cache first
  const cached = cacheManager.get<PolicyCategory[]>(cacheKey)
  if (cached) return cached

  // Fetch from API
  const response = await apiClient.get(cacheKey)
  const data = response.data.results || response.data

  // Cache for 10 minutes (categories don't change often)
  cacheManager.set(cacheKey, data, undefined, 10 * 60 * 1000)

  return data
}

// Get category by slug
export const getCategoryBySlug = async (slug: string): Promise<PolicyCategory> => {
  const response = await apiClient.get(`/policies/categories/${slug}/`)
  return response.data
}

// Get all insurance companies (cached for 10 minutes)
export const getInsuranceCompanies = async (): Promise<InsuranceCompany[]> => {
  const cacheKey = '/policies/companies/'

  // Check cache first
  const cached = cacheManager.get<InsuranceCompany[]>(cacheKey)
  if (cached) return cached

  // Fetch from API
  const response = await apiClient.get(cacheKey)
  const data = response.data.results || response.data

  // Cache for 10 minutes
  cacheManager.set(cacheKey, data, undefined, 10 * 60 * 1000)

  return data
}

// Get insurance company by ID
export const getCompanyById = async (id: string): Promise<InsuranceCompany> => {
  const response = await apiClient.get(`/policies/companies/${id}/`)
  return response.data
}

// Get all policy types (with optional filters) - cached for 3 minutes
export const getPolicyTypes = async (filters?: PolicyTypeFilters): Promise<PolicyType[]> => {
  const cacheKey = '/policies/types/'

  // Check cache first
  const cached = cacheManager.get<PolicyType[]>(cacheKey, filters)
  if (cached) return cached

  // Fetch from API
  const response = await apiClient.get(cacheKey, { params: filters })
  const data = response.data.results || response.data

  // Cache for 3 minutes (policies change more frequently)
  cacheManager.set(cacheKey, data, filters, 3 * 60 * 1000)

  return data
}

// Get featured policy types (cached for 5 minutes)
export const getFeaturedPolicies = async (): Promise<PolicyType[]> => {
  const cacheKey = '/policies/types/featured/'

  // Check cache first
  const cached = cacheManager.get<PolicyType[]>(cacheKey)
  if (cached) return cached

  // Fetch from API
  const response = await apiClient.get(cacheKey)
  const data = response.data.results || response.data

  // Cache for 5 minutes
  cacheManager.set(cacheKey, data, undefined, 5 * 60 * 1000)

  return data
}

// Get policy type by ID (cached for 5 minutes)
export const getPolicyTypeById = async (id: string): Promise<PolicyTypeDetail> => {
  const cacheKey = `/policies/types/${id}/`

  // Check cache first
  const cached = cacheManager.get<PolicyTypeDetail>(cacheKey)
  if (cached) return cached

  // Fetch from API
  const response = await apiClient.get(cacheKey)
  const data = response.data

  // Cache for 5 minutes
  cacheManager.set(cacheKey, data, undefined, 5 * 60 * 1000)

  return data
}

// Get policy types by category (cached for 3 minutes)
export const getPolicyTypesByCategory = async (categorySlug: string): Promise<PolicyType[]> => {
  const cacheKey = '/policies/types/'
  const params = { category: categorySlug }

  // Check cache first
  const cached = cacheManager.get<PolicyType[]>(cacheKey, params)
  if (cached) return cached

  // Fetch from API
  const response = await apiClient.get(cacheKey, { params })
  const data = response.data.results || response.data

  // Cache for 3 minutes
  cacheManager.set(cacheKey, data, params, 3 * 60 * 1000)

  return data
}

// Get policy reviews
export const getPolicyReviews = async (policyTypeId: string): Promise<PolicyReview[]> => {
  const response = await apiClient.get('/policies/reviews/', {
    params: { policy_type: policyTypeId }
  })
  // Handle paginated response
  return response.data.results || response.data
}

// Submit policy review
export const submitPolicyReview = async (data: {
  policy_type: string
  rating: number
  review: string
}): Promise<PolicyReview> => {
  const response = await apiClient.post('/policies/reviews/', data)
  return response.data
}

// Search policy types
export const searchPolicyTypes = async (query: string): Promise<PolicyType[]> => {
  const response = await apiClient.get('/policies/types/', {
    params: { search: query }
  })
  // Handle paginated response
  return response.data.results || response.data
}

// Get policy comparison data
export const comparePolicies = async (policyIds: string[]): Promise<PolicyTypeDetail[]> => {
  const promises = policyIds.map(id => getPolicyTypeById(id))
  return Promise.all(promises)
}
