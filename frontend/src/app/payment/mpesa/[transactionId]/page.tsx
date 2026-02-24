'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { paymentsApi } from '@/lib/api/payments'
import { getErrorMessage } from '@/lib/api/errors'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ErrorBoundary } from '@/components/shared/error-boundary'

type PaymentStatus = 'idle' | 'initiating' | 'waiting' | 'checking' | 'success' | 'failed'

function MpesaPaymentContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const transactionId = params.transactionId as string
  const phoneNumber = searchParams.get('phone') || ''
  const amount = searchParams.get('amount') || '0'

  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [checkoutRequestId, setCheckoutRequestId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [statusCheckCount, setStatusCheckCount] = useState(0)

  const initiatePayment = async () => {
    setStatus('initiating')
    setErrorMessage('')

    try {
      const response = await paymentsApi.initiateMpesa({
        transaction_id: transactionId,
        phone_number: phoneNumber,
        amount: parseFloat(amount),
        description: 'Insurance Premium Payment'
      })

      if (response.success) {
        setCheckoutRequestId(response.checkout_request_id)
        setStatus('waiting')
        toast.success(response.message || 'Payment prompt sent to your phone')

        // Start status checking after 5 seconds
        setTimeout(() => {
          startStatusChecking()
        }, 5000)
      } else {
        setStatus('failed')
        setErrorMessage(response.message || 'Failed to initiate payment')
        toast.error(response.message || 'Failed to initiate payment')
      }
    } catch (error: unknown) {
      console.error('M-Pesa initiation error:', error)
      setStatus('failed')
      const message = getErrorMessage(error, 'Failed to initiate payment')
      setErrorMessage(message)
      toast.error(message)
    }
  }

  const startStatusChecking = () => {
    setStatus('checking')
    checkPaymentStatus()
  }

  const checkPaymentStatus = async () => {
    if (statusCheckCount >= 30) {
      // Stop after 30 attempts (approx 2.5 minutes)
      setStatus('failed')
      setErrorMessage('Payment verification timeout. Please check your M-Pesa messages.')
      return
    }

    try {
      const response = await paymentsApi.checkMpesaStatus(transactionId)

      if (response.status === 'completed') {
        setStatus('success')
        toast.success('Payment successful!')
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          router.push(`/payment/success/${transactionId}`)
        }, 2000)
        return
      } else if (response.status === 'failed') {
        setStatus('failed')
        setErrorMessage('Payment was cancelled or failed. Please try again.')
        return
      }

      // If still pending, check again after 5 seconds
      setStatusCheckCount(prev => prev + 1)
      setTimeout(checkPaymentStatus, 5000)

    } catch (error: unknown) {
      console.error('Status check error:', error)
      // Continue checking even if there's an error
      setStatusCheckCount(prev => prev + 1)
      setTimeout(checkPaymentStatus, 5000)
    }
  }

  const handleRetry = () => {
    setStatus('idle')
    setErrorMessage('')
    setStatusCheckCount(0)
    setCheckoutRequestId('')
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        {status === 'idle' && (
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === 'success' ? (
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              ) : status === 'failed' ? (
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  {status === 'initiating' || status === 'checking' ? (
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  ) : (
                    <Smartphone className="w-12 h-12 text-primary" />
                  )}
                </div>
              )}
            </div>

            <CardTitle>
              {status === 'idle' && 'M-Pesa Payment'}
              {status === 'initiating' && 'Initiating Payment...'}
              {status === 'waiting' && 'Check Your Phone'}
              {status === 'checking' && 'Verifying Payment...'}
              {status === 'success' && 'Payment Successful!'}
              {status === 'failed' && 'Payment Failed'}
            </CardTitle>

            <CardDescription>
              {status === 'idle' && 'Click below to send the payment prompt to your phone'}
              {status === 'initiating' && 'Sending payment prompt to your M-Pesa...'}
              {status === 'waiting' && 'Enter your M-Pesa PIN on your phone'}
              {status === 'checking' && 'Please wait while we confirm your payment'}
              {status === 'success' && 'Your payment has been processed successfully'}
              {status === 'failed' && 'We could not process your payment'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone Number:</span>
                <span className="font-medium">{phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">KES {parseFloat(amount).toLocaleString()}</span>
              </div>
              {checkoutRequestId && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Request ID:</span>
                  <span className="font-mono">{checkoutRequestId.slice(0, 20)}...</span>
                </div>
              )}
            </div>

            {/* Status Instructions */}
            {status === 'waiting' && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  Next Steps:
                </h4>
                <ol className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>1. Check your phone for the M-Pesa payment prompt</li>
                  <li>2. Enter your M-Pesa PIN to complete the payment</li>
                  <li>3. Wait for the confirmation message</li>
                  <li>4. We'll automatically verify your payment</li>
                </ol>
              </div>
            )}

            {status === 'checking' && (
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-lg p-4 text-center">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Verifying your payment... This may take up to 2 minutes.
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                  Attempt {statusCheckCount} of 30
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg p-4 text-center">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Payment processed successfully! Redirecting to confirmation page...
                </p>
              </div>
            )}

            {status === 'failed' && errorMessage && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {status === 'idle' && (
                <Button onClick={initiatePayment} size="lg" className="w-full">
                  Send Payment Prompt
                </Button>
              )}

              {status === 'failed' && (
                <>
                  <Button onClick={handleRetry} size="lg" className="w-full">
                    Try Again
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="lg" className="w-full">
                    Cancel Payment
                  </Button>
                </>
              )}

              {(status === 'waiting' || status === 'checking') && (
                <Button onClick={handleCancel} variant="outline" size="lg" className="w-full">
                  Cancel
                </Button>
              )}
            </div>

            {/* Help Text */}
            {status !== 'success' && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Need help? Contact support at support@bowmaninsurance.com</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        {status === 'idle' && (
          <Card className="mt-6 bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Payment Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Ensure your phone has network coverage</p>
              <p>• Make sure you have sufficient M-Pesa balance</p>
              <p>• The payment prompt will appear within seconds</p>
              <p>• You have 60 seconds to enter your PIN</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function MpesaPaymentPage() {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <MpesaPaymentContent />
      </ErrorBoundary>
    </ProtectedRoute>
  )
}
