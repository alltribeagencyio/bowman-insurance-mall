'use client'

import { useState, useEffect } from 'react'
import { InsuranceShop } from '@/components/shop/InsuranceShop'
import {
  getPolicyTypes,
  getCategories,
  getInsuranceCompanies,
  type PolicyType,
  type PolicyCategory,
  type InsuranceCompany
} from '@/lib/api/categories'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ShopPage() {
  const [products, setProducts] = useState<PolicyType[]>([])
  const [categories, setCategories] = useState<PolicyCategory[]>([])
  const [companies, setCompanies] = useState<InsuranceCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true)

        // Fetch all data in parallel
        const [policiesData, categoriesData, companiesData] = await Promise.all([
          getPolicyTypes(),
          getCategories(),
          getInsuranceCompanies()
        ])

        setProducts(policiesData)
        setCategories(categoriesData)
        setCompanies(companiesData.filter(c => c.is_active))
      } catch (error) {
        console.error('Error loading shop data:', error)
        toast.error('Failed to load insurance products')
      } finally {
        setIsLoading(false)
      }
    }

    loadAllData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Loading Insurance Mall...</h3>
          <p className="text-muted-foreground">
            Please wait while we fetch all available products
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
    subcategories: categories.map(c => c.name),
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
    category: policy.category_name,
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
      title="Insurance Mall - All Products"
      description="Browse all insurance products from Kenya's leading providers"
      filterOptions={filterOptions}
      showSubcategories={true}
    />
  )
}
