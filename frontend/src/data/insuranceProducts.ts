// Comprehensive insurance products database

export interface InsuranceProduct {
  id: string
  name: string
  company: string
  category: string
  subcategory?: string
  premium: number
  coverage: number
  rating: number
  features: string[]
  description: string
  badge?: string
}

export const ALL_PRODUCTS: InsuranceProduct[] = [
  // ========== MOTOR INSURANCE ==========
  // Boda Boda
  {
    id: 'mo-boda-1',
    name: 'Boda Boda Comprehensive',
    company: 'Jubilee Insurance',
    category: 'Motor',
    subcategory: 'Boda Boda',
    premium: 3500,
    coverage: 500000,
    rating: 4.6,
    features: ['Accident cover', 'Third party liability', 'Theft protection', 'Passenger cover'],
    description: 'Complete protection for commercial motorcycle riders',
    badge: 'Popular',
  },
  {
    id: 'mo-boda-2',
    name: 'Rider Plus Insurance',
    company: 'Britam',
    category: 'Motor',
    subcategory: 'Boda Boda',
    premium: 2800,
    coverage: 400000,
    rating: 4.4,
    features: ['Third party only', 'Personal accident', 'Medical expenses'],
    description: 'Affordable boda boda insurance for riders',
  },
  {
    id: 'mo-boda-3',
    name: 'Motorbike Shield',
    company: 'AAR Insurance',
    category: 'Motor',
    subcategory: 'Boda Boda',
    premium: 4200,
    coverage: 600000,
    rating: 4.7,
    features: ['Comprehensive cover', 'Roadside assistance', 'Fire & theft', 'Passenger liability'],
    description: 'Premium boda boda insurance with extra benefits',
  },

  // Private Car
  {
    id: 'mo-car-1',
    name: 'Comprehensive Motor Cover',
    company: 'Jubilee Insurance',
    category: 'Motor',
    subcategory: 'Private Car',
    premium: 15000,
    coverage: 2000000,
    rating: 4.5,
    features: ['Accident cover', 'Third party liability', 'Theft protection', 'Roadside assistance'],
    description: 'Complete vehicle protection for private cars',
    badge: 'Best Value',
  },
  {
    id: 'mo-car-2',
    name: 'Auto Shield Plus',
    company: 'Britam',
    category: 'Motor',
    subcategory: 'Private Car',
    premium: 18000,
    coverage: 3000000,
    rating: 4.7,
    features: ['Comprehensive cover', 'Personal accident', 'Windscreen cover', '24/7 support'],
    description: 'Premium motor insurance with enhanced benefits',
  },
  {
    id: 'mo-car-3',
    name: 'Drive Safe Cover',
    company: 'AAR Insurance',
    category: 'Motor',
    subcategory: 'Private Car',
    premium: 12500,
    coverage: 1500000,
    rating: 4.4,
    features: ['Third party fire & theft', 'Emergency services', 'Towing services'],
    description: 'Affordable motor protection for private vehicles',
  },
  {
    id: 'mo-car-4',
    name: 'Elite Motor Insurance',
    company: 'CIC Insurance',
    category: 'Motor',
    subcategory: 'Private Car',
    premium: 22000,
    coverage: 4000000,
    rating: 4.8,
    features: ['Comprehensive', 'Courtesy car', 'Windscreen & tyres', 'Key replacement'],
    description: 'Premium coverage for high-value vehicles',
    badge: 'Premium',
  },

  // PSV (Public Service Vehicle)
  {
    id: 'mo-psv-1',
    name: 'Matatu Comprehensive',
    company: 'Madison Insurance',
    category: 'Motor',
    subcategory: 'PSV',
    premium: 25000,
    coverage: 3000000,
    rating: 4.5,
    features: ['Passenger liability', 'Accident cover', 'Third party', 'Emergency response'],
    description: 'Complete coverage for public service vehicles',
  },
  {
    id: 'mo-psv-2',
    name: 'PSV Shield Pro',
    company: 'Britam',
    category: 'Motor',
    subcategory: 'PSV',
    premium: 28000,
    coverage: 3500000,
    rating: 4.6,
    features: ['Comprehensive', 'Passenger cover', 'Driver personal accident', 'Legal assistance'],
    description: 'Premium PSV insurance with legal support',
    badge: 'Recommended',
  },

  // Uber/Taxi
  {
    id: 'mo-uber-1',
    name: 'Rideshare Insurance',
    company: 'Jubilee Insurance',
    category: 'Motor',
    subcategory: 'Uber/Taxi',
    premium: 18000,
    coverage: 2500000,
    rating: 4.7,
    features: ['Commercial use', 'Passenger liability', 'Personal accident', 'Breakdown cover'],
    description: 'Specialized insurance for rideshare drivers',
    badge: 'Popular',
  },
  {
    id: 'mo-uber-2',
    name: 'Taxi Pro Cover',
    company: 'AAR Insurance',
    category: 'Motor',
    subcategory: 'Uber/Taxi',
    premium: 16500,
    coverage: 2000000,
    rating: 4.5,
    features: ['Third party', 'Passenger cover', 'Fire & theft', 'Medical expenses'],
    description: 'Affordable taxi insurance for commercial drivers',
  },

  // Truck/Commercial
  {
    id: 'mo-truck-1',
    name: 'Heavy Goods Vehicle Cover',
    company: 'CIC Insurance',
    category: 'Motor',
    subcategory: 'Truck/Commercial',
    premium: 35000,
    coverage: 5000000,
    rating: 4.6,
    features: ['Goods in transit', 'Third party liability', 'Breakdown', 'Theft protection'],
    description: 'Comprehensive coverage for commercial trucks',
  },

  // ========== MEDICAL INSURANCE ==========
  {
    id: 'med-1',
    name: 'Afya Plus Medical Plan',
    company: 'AAR Insurance',
    category: 'Medical',
    premium: 12000,
    coverage: 5000000,
    rating: 4.8,
    features: ['Outpatient cover', 'Inpatient cover', 'Maternity', 'Dental & Optical'],
    description: 'Comprehensive health coverage for individuals and families',
    badge: 'Most Popular',
  },
  {
    id: 'med-2',
    name: 'Jamii Plus',
    company: 'Jubilee Insurance',
    category: 'Medical',
    premium: 10500,
    coverage: 4000000,
    rating: 4.6,
    features: ['Inpatient', 'Outpatient', 'Specialist consultation', 'Chronic illness cover'],
    description: 'Affordable family health insurance',
  },
  {
    id: 'med-3',
    name: 'Smart Health',
    company: 'Britam',
    category: 'Medical',
    premium: 15000,
    coverage: 10000000,
    rating: 4.9,
    features: ['Unlimited outpatient', 'Inpatient', 'Maternity', 'Emergency evacuation'],
    description: 'Premium health insurance with extensive coverage',
    badge: 'Premium',
  },
  {
    id: 'med-4',
    name: 'Familia Care',
    company: 'CIC Insurance',
    category: 'Medical',
    premium: 8500,
    coverage: 3000000,
    rating: 4.5,
    features: ['Outpatient', 'Inpatient', 'Maternity', 'Optical'],
    description: 'Budget-friendly family health plan',
  },
  {
    id: 'med-5',
    name: 'Mediplus Cover',
    company: 'Madison Insurance',
    category: 'Medical',
    premium: 11000,
    coverage: 6000000,
    rating: 4.7,
    features: ['Comprehensive outpatient', 'Inpatient', 'Dental', 'Maternity'],
    description: 'Complete medical coverage for families',
  },
  {
    id: 'med-6',
    name: 'Executive Health Plan',
    company: 'Old Mutual',
    category: 'Medical',
    premium: 20000,
    coverage: 15000000,
    rating: 4.9,
    features: ['International cover', 'Specialist care', 'VIP hospitals', 'Wellness programs'],
    description: 'Elite health insurance for executives',
    badge: 'Premium',
  },

  // ========== LIFE INSURANCE ==========
  {
    id: 'life-1',
    name: 'Whole Life Cover',
    company: 'Britam',
    category: 'Life',
    premium: 5000,
    coverage: 10000000,
    rating: 4.6,
    features: ['Death benefit', 'Savings plan', 'Loan facility', 'Tax benefits'],
    description: 'Lifetime protection with savings component',
    badge: 'Recommended',
  },
  {
    id: 'life-2',
    name: 'Family Protection Plan',
    company: 'Jubilee Insurance',
    category: 'Life',
    premium: 7500,
    coverage: 15000000,
    rating: 4.8,
    features: ['Life cover', 'Education benefit', 'Critical illness', 'Last expense'],
    description: 'Comprehensive family life insurance',
    badge: 'Popular',
  },
  {
    id: 'life-3',
    name: 'Term Assurance',
    company: 'CIC Insurance',
    category: 'Life',
    premium: 3500,
    coverage: 5000000,
    rating: 4.3,
    features: ['Death benefit', 'Affordable premiums', 'Flexible terms'],
    description: 'Simple term life cover',
  },
  {
    id: 'life-4',
    name: 'Education Plan',
    company: 'Old Mutual',
    category: 'Life',
    premium: 6000,
    coverage: 8000000,
    rating: 4.7,
    features: ['School fees cover', 'Savings component', 'Life protection', 'Maturity benefit'],
    description: 'Secure your children\'s education future',
  },

  // ========== HOME INSURANCE ==========
  {
    id: 'home-1',
    name: 'Home Plus',
    company: 'Britam',
    category: 'Home',
    premium: 8000,
    coverage: 5000000,
    rating: 4.5,
    features: ['Building cover', 'Contents cover', 'Theft protection', 'Fire & water damage'],
    description: 'Complete home protection',
  },
  {
    id: 'home-2',
    name: 'Property Guard',
    company: 'Jubilee Insurance',
    category: 'Home',
    premium: 10000,
    coverage: 8000000,
    rating: 4.6,
    features: ['Building & contents', 'Natural disasters', 'Personal liability', 'Alternative accommodation'],
    description: 'Premium property insurance',
    badge: 'Comprehensive',
  },
  {
    id: 'home-3',
    name: 'Tenant Insurance',
    company: 'AAR Insurance',
    category: 'Home',
    premium: 3500,
    coverage: 2000000,
    rating: 4.4,
    features: ['Contents only', 'Personal liability', 'Theft', 'Fire damage'],
    description: 'Affordable insurance for tenants',
  },

  // ========== TRAVEL INSURANCE ==========
  {
    id: 'travel-1',
    name: 'Travel Safe',
    company: 'AAR Insurance',
    category: 'Travel',
    premium: 1500,
    coverage: 1000000,
    rating: 4.4,
    features: ['Medical emergencies', 'Trip cancellation', 'Lost baggage', 'Flight delay'],
    description: 'Essential travel protection',
  },
  {
    id: 'travel-2',
    name: 'Global Explorer',
    company: 'Britam',
    category: 'Travel',
    premium: 2500,
    coverage: 2000000,
    rating: 4.7,
    features: ['Worldwide cover', 'Emergency evacuation', 'Adventure sports', 'Repatriation'],
    description: 'Comprehensive international travel insurance',
    badge: 'Popular',
  },
  {
    id: 'travel-3',
    name: 'Family Travel Plan',
    company: 'Old Mutual',
    category: 'Travel',
    premium: 4000,
    coverage: 3000000,
    rating: 4.6,
    features: ['Family coverage', 'Medical expenses', 'Trip interruption', 'Personal liability'],
    description: 'Complete travel cover for the whole family',
  },

  // ========== BUSINESS INSURANCE ==========
  {
    id: 'biz-1',
    name: 'Business Shield',
    company: 'CIC Insurance',
    category: 'Business',
    premium: 25000,
    coverage: 20000000,
    rating: 4.5,
    features: ['Property damage', 'Business interruption', 'Public liability', 'Employee cover'],
    description: 'Complete SME protection',
    badge: 'Popular',
  },
  {
    id: 'biz-2',
    name: 'Professional Indemnity',
    company: 'Jubilee Insurance',
    category: 'Business',
    premium: 35000,
    coverage: 30000000,
    rating: 4.7,
    features: ['Professional liability', 'Legal defense', 'Client claims', 'Cyber risks'],
    description: 'Protection for professional service providers',
  },
  {
    id: 'biz-3',
    name: 'Shop Keeper Insurance',
    company: 'Madison Insurance',
    category: 'Business',
    premium: 15000,
    coverage: 10000000,
    rating: 4.4,
    features: ['Stock cover', 'Public liability', 'Fire & theft', 'Employer liability'],
    description: 'Affordable insurance for retail businesses',
  },
]

// Helper functions
export const getProductsByCategory = (category: string): InsuranceProduct[] => {
  return ALL_PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase())
}

export const getProductsByCompany = (company: string): InsuranceProduct[] => {
  return ALL_PRODUCTS.filter(p => p.company.toLowerCase() === company.toLowerCase())
}

export const getProductsBySubcategory = (category: string, subcategory: string): InsuranceProduct[] => {
  return ALL_PRODUCTS.filter(
    p => p.category.toLowerCase() === category.toLowerCase() &&
         p.subcategory?.toLowerCase() === subcategory.toLowerCase()
  )
}

export const getUniqueCompanies = (): string[] => {
  return Array.from(new Set(ALL_PRODUCTS.map(p => p.company))).sort()
}

export const getSubcategoriesByCategory = (category: string): string[] => {
  const products = getProductsByCategory(category)
  const subcategories = products
    .map(p => p.subcategory)
    .filter((sub): sub is string => sub !== undefined)
  return Array.from(new Set(subcategories)).sort()
}

export const getCategoryInfo = (category: string) => {
  const categoryMap: Record<string, { title: string; description: string }> = {
    motor: {
      title: 'Motor Insurance',
      description: 'Comprehensive vehicle protection for all types of vehicles in Kenya',
    },
    medical: {
      title: 'Medical Insurance',
      description: 'Health insurance plans from Kenya\'s top insurers',
    },
    life: {
      title: 'Life Insurance',
      description: 'Secure your family\'s future with life insurance',
    },
    home: {
      title: 'Home Insurance',
      description: 'Protect your property and belongings',
    },
    travel: {
      title: 'Travel Insurance',
      description: 'Travel with confidence and protection',
    },
    business: {
      title: 'Business Insurance',
      description: 'Comprehensive protection for your business',
    },
  }

  return categoryMap[category.toLowerCase()] || {
    title: 'Insurance Products',
    description: 'Find the perfect insurance for your needs',
  }
}
