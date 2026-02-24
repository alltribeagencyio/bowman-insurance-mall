/**
 * Type-safe error handling utilities for API calls.
 * Eliminates the need for `error: any` in catch blocks.
 */

export interface ApiError {
  response?: {
    status: number
    data?: unknown
  }
  message: string
  code?: string
}

/**
 * Type guard — checks if an unknown error is an ApiError (Axios error shape).
 */
export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error
}

/**
 * Safely extract HTTP status code from an unknown catch-block error.
 * Returns undefined if the error has no response status.
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (isApiError(error)) return error.response?.status
  return undefined
}

/**
 * Safely extract a human-readable message from an unknown catch-block error.
 * Checks response data fields (detail, message, error) before falling back.
 * Pass a custom `fallback` to override the generic default message.
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (isApiError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined
    if (data) {
      const detail = data['detail'] ?? data['message'] ?? data['error']
      if (typeof detail === 'string') return detail
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return fallback
}
