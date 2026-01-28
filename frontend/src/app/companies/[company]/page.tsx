'use client'

import { use } from 'react'
import { InsuranceShop } from '@/components/shop/InsuranceShop'
import {
  getProductsByCompany,
  getUniqueCompanies,
  ALL_PRODUCTS,
} from '@/data/insuranceProducts'

interface CompanyPageProps {
  params: Promise<{ company: string }>
}

export default function CompanyPage({ params }: CompanyPageProps) {
  const resolvedParams = use(params)
  const companySlug = resolvedParams.company

  // Convert slug back to company name (e.g., "aar-insurance" -> "AAR Insurance")
  const companyName = decodeURIComponent(companySlug)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  // Get products for this company
  const products = getProductsByCompany(companyName)
  const allCompanies = getUniqueCompanies()

  // Calculate price and coverage ranges
  const premiums = products.map(p => p.premium)
  const coverages = products.map(p => p.coverage)

  const filterOptions = {
    companies: allCompanies,
    priceRange: {
      min: premiums.length > 0 ? Math.min(...premiums) : 0,
      max: premiums.length > 0 ? Math.max(...premiums) : 1000000,
    },
    coverageRange: {
      min: coverages.length > 0 ? Math.min(...coverages) : 0,
      max: coverages.length > 0 ? Math.max(...coverages) : 100000000,
    },
  }

  return (
    <InsuranceShop
      products={products}
      title={`${companyName} Insurance Products`}
      description={`Browse all insurance products offered by ${companyName}`}
      filterOptions={filterOptions}
      showSubcategories={false}
    />
  )
}
