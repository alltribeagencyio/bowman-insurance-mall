import { apiClient } from './client'

export interface Beneficiary {
  id: string
  name: string
  relationship: string
  percentage: number
  phone: string
  email: string
  date_of_birth?: string
  national_id?: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface BeneficiaryInput {
  name: string
  relationship: string
  percentage: number
  phone: string
  email: string
  date_of_birth?: string
  national_id?: string
  is_primary?: boolean
}

// Get all user beneficiaries
export const getBeneficiaries = async (): Promise<Beneficiary[]> => {
  const response = await apiClient.get('auth/beneficiaries/')
  return response.data
}

// Get beneficiary by ID
export const getBeneficiaryById = async (id: string): Promise<Beneficiary> => {
  const response = await apiClient.get(`auth/beneficiaries/${id}/`)
  return response.data
}

// Create beneficiary
export const createBeneficiary = async (data: BeneficiaryInput): Promise<Beneficiary> => {
  const response = await apiClient.post('auth/beneficiaries/', data)
  return response.data
}

// Update beneficiary
export const updateBeneficiary = async (
  id: string,
  data: Partial<BeneficiaryInput>
): Promise<Beneficiary> => {
  const response = await apiClient.patch(`auth/beneficiaries/${id}/`, data)
  return response.data
}

// Delete beneficiary
export const deleteBeneficiary = async (id: string): Promise<void> => {
  await apiClient.delete(`auth/beneficiaries/${id}/`)
}

// Set primary beneficiary
export const setPrimaryBeneficiary = async (id: string): Promise<Beneficiary> => {
  const response = await apiClient.post(`auth/beneficiaries/${id}/set-primary/`)
  return response.data
}
