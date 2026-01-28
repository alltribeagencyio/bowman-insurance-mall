'use client'

import { use } from 'react'
import { InsuranceShop } from '@/components/shop/InsuranceShop'
import {
  getProductsByCategory,
  getUniqueCompanies,
  getSubcategoriesByCategory,
  getCategoryInfo,
} from '@/data/insuranceProducts'

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params)
  const category = resolvedParams.category

  // Get products and filter options
  const products = getProductsByCategory(category)
  const subcategories = getSubcategoriesByCategory(category)
  const companies = getUniqueCompanies()
  const info = getCategoryInfo(category)

  // Calculate price and coverage ranges
  const premiums = products.map(p => p.premium)
  const coverages = products.map(p => p.coverage)

  const filterOptions = {
    companies,
    subcategories: subcategories.length > 0 ? subcategories : undefined,
    priceRange: {
      min: Math.min(...premiums, 0),
      max: Math.max(...premiums, 1000000),
    },
    coverageRange: {
      min: Math.min(...coverages, 0),
      max: Math.max(...coverages, 100000000),
    },
  }

  return (
    <InsuranceShop
      products={products}
      title={info.title}
      description={info.description}
      filterOptions={filterOptions}
      showSubcategories={subcategories.length > 0}
    />
  )
}
