'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Loader2, ArrowLeft, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { paymentsApi } from '@/lib/api/payments'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/lib/auth/auth-context'

type PaymentStatus = 'idle' | 'initializing' | 'redirecting' | 'verifying' | 'complete'

function CardPaymentContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const transactionId = params.transactionId as string
  const amount = searchParams.get('amount') || '0'
  const reference = searchParams.get('reference')

  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [paymentUrl, setPaymentUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // If reference exists in URL, verify the payment
  useEffect(() => {
    if (reference) {
      verifyPayment(reference)
    }
  }, [reference])

  const initializePayment = async () => {
    if (!user?.email) {
      toast.error('User email not found')
      return
    }

    setStatus('initializing')
    setErrorMessage('')

    try {
      const callbackUrl = `${window.location.origin}/payment/card/${transactionId}`

      const response = await paymentsApi.initializePaystack({
        transaction_id: transactionId,
        email: user.email,
        amount: parseFloat(amount),
        callback_url: callbackUrl
      })

      if (response.success) {
        setPaymentUrl(response.authorization_url)
        setStatus('redirecting')
        toast.success('Redirecting to payment page...')

        // Redirect to Paystack
        setTimeout(() => {
          window.location.href = response.authorization_url
        }, 1500)
      } else {
        setStatus('idle')
        setErrorMessage('Failed to initialize payment')
        toast.error('Failed to initialize payment')
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error)
      setStatus('idle')
      const message = error.response?.data?.message || error.message || 'Failed to initialize payment'
      setErrorMessage(message)
      toast.error(message)
    }
  }

  const verifyPayment = async (ref: string) => {
    setStatus('verifying')

    try {
      const response = await paymentsApi.verifyPaystack(ref)

      if (response.success && response.status === 'completed') {
        setStatus('complete')
        toast.success('Payment verified successfully!')

        // Redirect to success page
        setTimeout(() => {
          router.push(`/payment/success/${transactionId}`)
        }, 2000)
      } else {
        setStatus('idle')
        setErrorMessage(response.message || 'Payment verification failed')
        toast.error(response.message || 'Payment verification failed')
      }
    } catch (error: any) {
      console.error('Payment verification error:', error)
      setStatus('idle')
      const message = error.response?.data?.message || error.message || 'Failed to verify payment'
      setErrorMessage(message)
      toast.error(message)
    }
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
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                {status === 'initializing' || status === 'verifying' ? (
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                ) : status === 'redirecting' ? (
                  <ExternalLink className="w-12 h-12 text-primary" />
                ) : (
                  <CreditCard className="w-12 h-12 text-primary" />
                )}
              </div>
            </div>

            <CardTitle>
              {status === 'idle' && 'Card Payment'}
              {status === 'initializing' && 'Initializing Payment...'}
              {status === 'redirecting' && 'Redirecting to Payment Page...'}
              {status === 'verifying' && 'Verifying Payment...'}
              {status === 'complete' && 'Payment Complete!'}
            </CardTitle>

            <CardDescription>
              {status === 'idle' && 'Click below to proceed to secure card payment'}
              {status === 'initializing' && 'Setting up your secure payment session...'}
              {status === 'redirecting' && 'You will be redirected to our payment partner'}
              {status === 'verifying' && 'Please wait while we verify your payment'}
              {status === 'complete' && 'Your payment has been verified successfully'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">KES {parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">Visa / Mastercard</span>
              </div>
            </div>

            {/* Status Messages */}
            {status === 'redirecting' && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  You will be redirected to our secure payment page. Please do not close this window.
                </p>
              </div>
            )}

            {status === 'verifying' && (
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Verifying your payment with our payment partner...
                </p>
              </div>
            )}

            {status === 'complete' && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Payment verified! Redirecting to confirmation page...
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {status === 'idle' && !errorMessage && (
                <Button onClick={initializePayment} size="lg" className="w-full">
                  Proceed to Card Payment
                </Button>
              )}

              {status === 'idle' && errorMessage && (
                <>
                  <Button onClick={initializePayment} size="lg" className="w-full">
                    Try Again
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="lg" className="w-full">
                    Cancel Payment
                  </Button>
                </>
              )}

              {(status === 'initializing' || status === 'redirecting' || status === 'verifying') && (
                <Button disabled size="lg" className="w-full">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Please Wait...
                </Button>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground mb-1">Secure Payment</p>
                  <p className="text-xs">
                    Your payment is processed through Paystack, a PCI-DSS compliant payment processor.
                    Your card details are never stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accepted Cards */}
        {status === 'idle' && (
          <Card className="mt-6 bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Accepted Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded border">
                  <span className="font-semibold text-blue-600">Visa</span>
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded border">
                  <span className="font-semibold text-orange-600">Mastercard</span>
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded border">
                  <span className="font-semibold text-blue-800">Verve</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                All major credit and debit cards accepted
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function CardPaymentPage() {
  return (
    <ProtectedRoute>
      <CardPaymentContent />
    </ProtectedRoute>
  )
}
