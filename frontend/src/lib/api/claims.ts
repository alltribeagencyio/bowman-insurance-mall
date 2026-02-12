import { apiClient } from './client'

export interface Claim {
  id: string
  claim_number: string
  policy: {
    id: string
    policy_number: string
    policy_type: string
  }
  type: 'accident' | 'theft' | 'fire' | 'natural_disaster' | 'medical' | 'other'
  description: string
  incident_date: string
  incident_location: string
  amount_claimed: string
  amount_approved?: string
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'settled'
  submitted_at: string
  assessment_date?: string
  settlement_date?: string
  assessor?: {
    id: string
    name: string
  }
  documents_count?: number
}

export interface ClaimDetail extends Claim {
  user: {
    id: string
    name: string
    email: string
  }
  documents: Array<{
    id: string
    title: string
    document_type: string
    file_url: string
    uploaded_at: string
  }>
  status_history: Array<{
    id: string
    from_status: string
    to_status: string
    notes: string
    changed_at: string
    changed_by: string
  }>
  settlement?: {
    amount: string
    payment_method: string
    transaction_reference: string
    settled_at: string
  }
}

export interface ClaimSubmitInput {
  policy: string
  type: string
  description: string
  incident_date: string
  incident_location: string
  amount_claimed: string
}

export interface ClaimDocumentInput {
  document_type: 'photos' | 'police_report' | 'medical_report' | 'repair_estimate' | 'other'
  title: string
  file_url: string
  file_size: number
  mime_type: string
}

export interface ClaimStatistics {
  total: number
  pending: number
  approved: number
  rejected: number
  settled: number
  total_claimed: string
  total_approved: string
  total_settled: string
}

// Submit new claim
export const submitClaim = async (data: ClaimSubmitInput): Promise<Claim> => {
  const response = await apiClient.post('/claims/', data)
  return response.data
}

// Get all user claims
export const getUserClaims = async (status?: string): Promise<Claim[]> => {
  const response = await apiClient.get('/claims/my_claims/', {
    params: status ? { status } : {}
  })
  return response.data
}

// Get claim by ID
export const getClaimById = async (id: string): Promise<ClaimDetail> => {
  const response = await apiClient.get(`/claims/${id}/`)
  return response.data
}

// Upload claim document
export const uploadClaimDocument = async (
  claimId: string,
  data: ClaimDocumentInput
): Promise<void> => {
  await apiClient.post(`/claims/${claimId}/upload_document/`, data)
}

// Get claim documents
export const getClaimDocuments = async (claimId: string): Promise<any[]> => {
  const response = await apiClient.get(`/claims/${claimId}/documents/`)
  return response.data
}

// Get claim status history
export const getClaimHistory = async (claimId: string): Promise<any[]> => {
  const response = await apiClient.get(`/claims/${claimId}/history/`)
  return response.data
}

// Get claim statistics
export const getClaimStatistics = async (): Promise<ClaimStatistics> => {
  const response = await apiClient.get('/claims/statistics/')
  return response.data
}

// Upload file to S3 (helper function for file uploads)
export const uploadFileToS3 = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ file_url: string; file_size: number; mime_type: string }> => {
  // This would typically involve:
  // 1. Getting a presigned URL from your backend
  // 2. Uploading directly to S3
  // 3. Returning the S3 URL

  // For now, we'll use a FormData upload through your backend
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post('/documents/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    },
  })

  return {
    file_url: response.data.file_url || response.data.url,
    file_size: file.size,
    mime_type: file.type
  }
}
