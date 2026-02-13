'use client'

import { useState, useEffect } from 'react'
import { InsuranceShop } from '@/components/shop/InsuranceShop'
import {
  getPolicyTypesByCategory,
  getCategoryBySlug,
  getInsuranceCompanies,
  type PolicyType,
  type PolicyCategory,
  type InsuranceCompany
} from '@/lib/api/categories'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CategoryPageProps {
  params: { category: string }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params
  const [products, setProducts] = useState<PolicyType[]>([])
  const [categoryInfo, setCategoryInfo] = useState<PolicyCategory | null>(null)
  const [companies, setCompanies] = useState<InsuranceCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setIsLoading(true)

        // Map 'medical' to 'health' for backward compatibility with existing data
        const backendCategorySlug = category === 'medical' ? 'health' : category

        // Fetch category info, policies, and companies in parallel
        const [categoryData, policiesData, companiesData] = await Promise.all([
          getCategoryBySlug(backendCategorySlug).catch(() => getCategoryBySlug(category)),
          getPolicyTypesByCategory(backendCategorySlug).catch(() => getPolicyTypesByCategory(category)),
          getInsuranceCompanies()
        ])

        setCategoryInfo(categoryData)
        setProducts(Array.isArray(policiesData) ? policiesData : [])
        setCompanies(companiesData.filter(c => c.is_active))
      } catch (error) {
        console.error('Error loading category data:', error)
        toast.error('Failed to load category products')
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCategoryData()
  }, [category])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Loading Products...</h3>
          <p className="text-muted-foreground">
            Please wait while we fetch the insurance products
          </p>
        </div>
      </div>
    )
  }

  // Calculate price and coverage ranges from API data
  const premiums = products.map(p => parseFloat(p.base_premium))
  const coverages = products
    .filter(p => p.min_coverage_amount)
    .map(p => parseFloat(p.min_coverage_amount!))

  const filterOptions = {
    companies: companies.map(c => c.name),
    subcategories: undefined, // Can be added later if needed
    priceRange: {
      min: premiums.length > 0 ? Math.min(...premiums) : 0,
      max: premiums.length > 0 ? Math.max(...premiums) : 1000000,
    },
    coverageRange: {
      min: coverages.length > 0 ? Math.min(...coverages) : 0,
      max: coverages.length > 0 ? Math.max(...coverages) : 100000000,
    },
  }

  // Transform API data to match InsuranceShop expected format
  const shopProducts = products.map(policy => ({
    id: policy.id,
    name: policy.name,
    company: policy.company_name,
    category: categoryInfo?.name || category,
    subcategory: '', // Can be derived from policy type if needed
    premium: parseFloat(policy.base_premium),
    coverage: policy.min_coverage_amount ? parseFloat(policy.min_coverage_amount) : 0,
    description: policy.description,
    features: policy.features,
    rating: 0, // Can be calculated from reviews if available
    reviews: 0,
    popular: policy.is_featured,
  }))

  return (
    <InsuranceShop
      products={shopProducts}
      title={categoryInfo?.name || category.charAt(0).toUpperCase() + category.slice(1)}
      description={categoryInfo?.description || `Browse our ${category} insurance products`}
      filterOptions={filterOptions}
      showSubcategories={false}
    />
  )
}
