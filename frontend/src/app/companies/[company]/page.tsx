'use client'

import { useState, useEffect } from 'react'
import { InsuranceShop } from '@/components/shop/InsuranceShop'
import {
  getPolicyTypes,
  getInsuranceCompanies,
  getCompanyById,
  type PolicyType,
  type InsuranceCompany
} from '@/lib/api/categories'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CompanyPageProps {
  params: { company: string }
}

export default function CompanyPage({ params }: CompanyPageProps) {
  const { company: companyId } = params
  const [products, setProducts] = useState<PolicyType[]>([])
  const [company, setCompany] = useState<InsuranceCompany | null>(null)
  const [companies, setCompanies] = useState<InsuranceCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setIsLoading(true)

        // Fetch company info and products for this company
        const [companyData, companyPolicies, companiesData] = await Promise.all([
          getCompanyById(companyId),
          getPolicyTypes({ company: companyId }),
          getInsuranceCompanies()
        ])

        setCompany(companyData)
        setProducts(companyPolicies)
        setCompanies(companiesData.filter(c => c.is_active))
      } catch (error) {
        console.error('Error loading company data:', error)
        toast.error('Failed to load company products')
      } finally {
        setIsLoading(false)
      }
    }

    loadCompanyData()
  }, [companyId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Loading Company Products...</h3>
          <p className="text-muted-foreground">
            Please wait while we fetch the insurance products
          </p>
        </div>
      </div>
    )
  }

  // Calculate price and coverage ranges
  const premiums = products.map(p => parseFloat(p.base_premium))
  const coverages = products
    .filter(p => p.min_coverage_amount)
    .map(p => parseFloat(p.min_coverage_amount!))

  const filterOptions = {
    companies: companies.map(c => c.name),
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
    subcategory: '',
    premium: parseFloat(policy.base_premium),
    coverage: policy.min_coverage_amount ? parseFloat(policy.min_coverage_amount) : 0,
    description: policy.description,
    features: policy.features,
    rating: 0,
    reviews: 0,
    popular: policy.is_featured,
  }))

  return (
    <InsuranceShop
      products={shopProducts}
      title={`${company?.name || 'Company'} Insurance Products`}
      description={company?.description || `Browse all insurance products offered by ${company?.name}`}
      filterOptions={filterOptions}
      showSubcategories={false}
    />
  )
}
