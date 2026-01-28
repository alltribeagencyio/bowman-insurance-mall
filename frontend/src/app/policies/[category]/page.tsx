import { InsuranceShop } from '@/components/shop/InsuranceShop'
import {
  getProductsByCategory,
  getUniqueCompanies,
  getSubcategoriesByCategory,
  getCategoryInfo,
} from '@/data/insuranceProducts'

interface CategoryPageProps {
  params: { category: string }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params

  // Get products and filter options
  const products = getProductsByCategory(category)
  const subcategories = getSubcategoriesByCategory(category)
  const companies = getUniqueCompanies()
  const info = getCategoryInfo(category)

  // Calculate price and coverage ranges safely
  const premiums = products.map(p => p.premium)
  const coverages = products.map(p => p.coverage)

  const filterOptions = {
    companies,
    subcategories: subcategories.length > 0 ? subcategories : undefined,
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
      title={info.title}
      description={info.description}
      filterOptions={filterOptions}
      showSubcategories={subcategories.length > 0}
    />
  )
}
