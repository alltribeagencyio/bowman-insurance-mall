'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, ArrowRight, Calendar, User, Phone, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function QuotePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    email: '',
    phone: '',
    id_number: '',

    // Vehicle Information
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    registration_number: '',
    vehicle_value: '',

    // Coverage
    cover_type: 'comprehensive',
    start_date: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success('Quote generated successfully!')
      router.push('/quote/results')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate quote')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Car className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Get Your Quote</h1>
          <p className="text-muted-foreground">
            Fill in the details below to get an instant insurance quote
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 rounded transition-colors ${
                      step > s ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-2">
            <span className={`text-sm ${step === 1 ? 'font-medium' : 'text-muted-foreground'}`}>
              Personal Info
            </span>
            <span className={`text-sm ${step === 2 ? 'font-medium' : 'text-muted-foreground'}`}>
              Vehicle Details
            </span>
            <span className={`text-sm ${step === 3 ? 'font-medium' : 'text-muted-foreground'}`}>
              Coverage
            </span>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Vehicle Details'}
              {step === 3 && 'Coverage Options'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Tell us about yourself'}
              {step === 2 && 'Provide your vehicle information'}
              {step === 3 && 'Choose your coverage type'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNext} className="space-y-4">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      <User className="h-4 w-4 inline mr-2" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+254712345678"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id_number">ID Number</Label>
                    <Input
                      id="id_number"
                      name="id_number"
                      type="text"
                      placeholder="12345678"
                      value={formData.id_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              {/* Step 2: Vehicle Details */}
              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_make">Make</Label>
                      <Input
                        id="vehicle_make"
                        name="vehicle_make"
                        type="text"
                        placeholder="Toyota"
                        value={formData.vehicle_make}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicle_model">Model</Label>
                      <Input
                        id="vehicle_model"
                        name="vehicle_model"
                        type="text"
                        placeholder="Corolla"
                        value={formData.vehicle_model}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicle_year">Year of Manufacture</Label>
                    <Input
                      id="vehicle_year"
                      name="vehicle_year"
                      type="number"
                      placeholder="2020"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={formData.vehicle_year}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration_number">Registration Number</Label>
                    <Input
                      id="registration_number"
                      name="registration_number"
                      type="text"
                      placeholder="KAA 123A"
                      value={formData.registration_number}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicle_value">Estimated Value (KES)</Label>
                    <Input
                      id="vehicle_value"
                      name="vehicle_value"
                      type="number"
                      placeholder="1000000"
                      value={formData.vehicle_value}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the current market value of your vehicle
                    </p>
                  </div>
                </>
              )}

              {/* Step 3: Coverage Options */}
              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cover_type">Coverage Type</Label>
                    <select
                      id="cover_type"
                      name="cover_type"
                      value={formData.cover_type}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      <option value="comprehensive">Comprehensive Cover</option>
                      <option value="third_party">Third Party Only</option>
                      <option value="third_party_fire">Third Party Fire & Theft</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Comprehensive cover provides the widest protection
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Coverage Start Date
                    </Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Summary */}
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-base">Quote Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vehicle:</span>
                        <span className="font-medium">
                          {formData.vehicle_make} {formData.vehicle_model} ({formData.vehicle_year})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Value:</span>
                        <span className="font-medium">
                          KES {parseInt(formData.vehicle_value || '0').toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cover Type:</span>
                        <span className="font-medium capitalize">
                          {formData.cover_type.replace('_', ' ')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-2 pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                )}
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    'Generating Quote...'
                  ) : step < 3 ? (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    'Get Quote'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Instant Quotes
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                No Hidden Fees
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Compare Multiple Insurers
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
