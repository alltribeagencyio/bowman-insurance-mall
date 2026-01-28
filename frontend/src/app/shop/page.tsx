'use client'

import { InsuranceShop } from '@/components/shop/InsuranceShop'
import {
  ALL_PRODUCTS,
  getUniqueCompanies,
} from '@/data/insuranceProducts'

export default function ShopPage() {
  const allCompanies = getUniqueCompanies()

  // Get all unique categories
  const allCategories = Array.from(new Set(ALL_PRODUCTS.map(p => p.category))).sort()

  // Calculate price and coverage ranges from all products
  const premiums = ALL_PRODUCTS.map(p => p.premium)
  const coverages = ALL_PRODUCTS.map(p => p.coverage)

  const filterOptions = {
    companies: allCompanies,
    subcategories: allCategories,
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
      products={ALL_PRODUCTS}
      title="Insurance Mall - All Products"
      description="Browse all insurance products from Kenya's leading providers"
      filterOptions={filterOptions}
      showSubcategories={true}
    />
  )
}
