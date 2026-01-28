import { apiClient } from './client'

export interface Document {
  id: string
  name: string
  type: 'certificate' | 'receipt' | 'id' | 'claim' | 'other'
  file_type: string
  size: number
  policy?: {
    id: string
    policy_number: string
  }
  uploaded_at: string
  verified: boolean
  url: string
}

export interface DocumentUploadProgress {
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

// Get all user documents
export const getUserDocuments = async (): Promise<Document[]> => {
  const response = await apiClient.get('/documents/')
  return response.data
}

// Get document by ID
export const getDocumentById = async (id: string): Promise<Document> => {
  const response = await apiClient.get(`/documents/${id}/`)
  return response.data
}

// Upload document
export const uploadDocument = async (
  file: File,
  type: string,
  policyId?: string,
  onProgress?: (progress: number) => void
): Promise<Document> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  if (policyId) {
    formData.append('policy_id', policyId)
  }

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

  return response.data
}

// Download document
export const downloadDocument = async (id: string): Promise<Blob> => {
  const response = await apiClient.get(`/documents/${id}/download/`, {
    responseType: 'blob',
  })
  return response.data
}

// Delete document
export const deleteDocument = async (id: string): Promise<void> => {
  await apiClient.delete(`/documents/${id}/`)
}

// Email document to user
export const emailDocument = async (id: string, email?: string): Promise<void> => {
  await apiClient.post(`/documents/${id}/email/`, { email })
}

// Get document statistics
export const getDocumentStats = async () => {
  const response = await apiClient.get('/documents/stats/')
  return response.data
}
