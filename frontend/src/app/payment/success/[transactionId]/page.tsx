'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Download, Home, FileText, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { paymentsApi } from '@/lib/api/payments'
import { getErrorStatus } from '@/lib/api/errors'
import { ProtectedRoute } from '@/components/auth/protected-route'
import type { Transaction, Receipt } from '@/types/payment'

function PaymentSuccessContent() {
  const params = useParams()
  const router = useRouter()
  const transactionId = params.transactionId as string

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTransactionDetails()
  }, [transactionId])

  const fetchTransactionDetails = async () => {
    try {
      const [transactionData, receiptData] = await Promise.all([
        paymentsApi.getTransaction(transactionId),
        paymentsApi.getReceipt(transactionId)
      ])

      setTransaction(transactionData)
      setReceipt(receiptData)
    } catch (error: unknown) {
      console.error('Failed to fetch transaction:', error)
      toast.error('Failed to load transaction details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReceipt = () => {
    // In production, this would generate a PDF
    toast.success('Receipt download started')
    // For now, just show the receipt data
    console.log('Receipt:', receipt)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Receipt',
          text: `Payment of ${receipt?.currency} ${receipt?.amount} completed successfully`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!transaction || transaction.status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Transaction not found or not completed</p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background dark:from-green-950 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-900 dark:text-green-100">
              Payment Successful!
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Your payment has been processed successfully
            </p>
          </CardHeader>
        </Card>

        {/* Payment Details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Transaction Number</p>
                <p className="font-mono font-semibold">{transaction.transaction_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="font-semibold text-lg">{transaction.amount_display}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium capitalize">{transaction.payment_method_display}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reference Number</p>
                <p className="font-mono text-sm">{transaction.reference_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="text-sm">
                  {new Date(transaction.processed_at || transaction.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {transaction.status_display}
                </span>
              </div>
            </div>

            {transaction.policy_number && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Policy Number</p>
                <p className="font-semibold">{transaction.policy_number}</p>
              </div>
            )}

            {transaction.description && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{transaction.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receipt Actions */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button onClick={handleDownloadReceipt} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button onClick={handleShare} variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/policies/details/${transaction.policy}`}>
                  <FileText className="w-4 h-4 mr-2" />
                  View Policy
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-base text-blue-900 dark:text-blue-100">
              What happens next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>✓ You will receive a confirmation email shortly</p>
            <p>✓ Your policy will be activated within 24 hours</p>
            <p>✓ Policy documents will be sent to your email</p>
            <p>✓ You can view your policy in the dashboard</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button size="lg" className="flex-1" asChild>
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="flex-1" asChild>
            <Link href="/policies">
              Browse More Policies
            </Link>
          </Button>
        </div>

        {/* Support */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            <p>Need help with your payment or policy?</p>
            <p className="mt-1">
              Contact us at{' '}
              <a href="mailto:support@bowmaninsurance.com" className="text-primary hover:underline">
                support@bowmaninsurance.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <ProtectedRoute>
      <PaymentSuccessContent />
    </ProtectedRoute>
  )
}
