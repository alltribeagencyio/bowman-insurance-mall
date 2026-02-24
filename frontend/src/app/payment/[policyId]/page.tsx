'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Smartphone, ArrowLeft, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { paymentsApi } from '@/lib/api/payments'
import { getErrorMessage } from '@/lib/api/errors'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/lib/auth/auth-context'

type PaymentMethod = 'mpesa' | 'card'

function PaymentSelectionContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const policyId = params.policyId as string

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState('15000')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleProceed = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method')
      return
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    if (selectedMethod === 'mpesa' && !phoneNumber) {
      toast.error('Please enter your M-Pesa phone number')
      return
    }

    const amountValue = parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Create transaction
      const transaction = await paymentsApi.initiatePayment({
        policy_id: policyId,
        amount: amountValue,
        payment_method: selectedMethod,
        phone_number: selectedMethod === 'mpesa' ? phoneNumber : undefined,
        description: 'Insurance Premium Payment'
      })

      toast.success('Transaction created successfully')

      // Step 2: Redirect to payment flow
      if (selectedMethod === 'mpesa') {
        router.push(`/payment/mpesa/${transaction.transaction_id}?phone=${encodeURIComponent(phoneNumber)}&amount=${amount}`)
      } else {
        router.push(`/payment/card/${transaction.transaction_id}?amount=${amount}`)
      }

    } catch (error: unknown) {
      console.error('Payment initiation error:', error)
      toast.error(getErrorMessage(error, 'Failed to initiate payment'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
          <p className="text-muted-foreground">
            Choose your preferred payment method
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amount */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Amount</CardTitle>
                <CardDescription>Enter the amount you want to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="15000"
                    min="1"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum amount: KES 100
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select how you want to pay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* M-Pesa Option */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedMethod === 'mpesa'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedMethod('mpesa')}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedMethod === 'mpesa' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">M-Pesa</h3>
                      <p className="text-sm text-muted-foreground">
                        Pay using your Safaricom M-Pesa mobile money
                      </p>
                      {selectedMethod === 'mpesa' && (
                        <div className="mt-4">
                          <Label htmlFor="phone">M-Pesa Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+254712345678"
                            className="mt-2"
                            disabled={isLoading}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter the number that will receive the payment prompt
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Option */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedMethod === 'card'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedMethod('card')}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedMethod === 'card' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Debit/Credit Card</h3>
                      <p className="text-sm text-muted-foreground">
                        Pay securely with Visa or Mastercard
                      </p>
                      <div className="flex gap-2 mt-2">
                        <div className="text-xs bg-muted px-2 py-1 rounded">Visa</div>
                        <div className="text-xs bg-muted px-2 py-1 rounded">Mastercard</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                  <label htmlFor="terms" className="text-sm">
                    I agree to the{' '}
                    <a href="/terms" className="text-primary hover:underline">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Proceed Button */}
            <Button
              onClick={handleProceed}
              disabled={!selectedMethod || !agreedToTerms || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Policy ID:</span>
                  <span className="font-medium text-sm">{policyId.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">KES {parseFloat(amount || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium capitalize">
                    {selectedMethod || 'Not selected'}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>KES {parseFloat(amount || '0').toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-green-900 dark:text-green-100">
                      Secure Payment
                    </h4>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSelectionPage() {
  return (
    <ProtectedRoute>
      <PaymentSelectionContent />
    </ProtectedRoute>
  )
}
