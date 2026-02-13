'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Shield,
  User,
  Car,
  FileText,
  Calendar,
  Building2,
  CreditCard,
  CheckCircle2,
  Plus,
  Edit2
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'
import { getPolicyTypeById } from '@/lib/api/categories'
import { purchasePolicy } from '@/lib/api/purchase'
import { paymentsApi } from '@/lib/api/payments'

// Mock saved vehicles
const savedVehicles = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2024,
    registration: 'KCE 123A',
    value: 8500000
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2022,
    registration: 'KDB 456B',
    value: 3200000
  }
]

interface PurchaseStep {
  id: string
  title: string
  description: string
}

export default function PurchasePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<any>({})
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    // Load product from API first (available to everyone)
    const loadProduct = async () => {
      try {
        const policyType = await getPolicyTypeById(params.id as string)
        setProduct({
          id: policyType.id,
          name: policyType.name,
          company: policyType.insurance_company.name,
          companyId: policyType.insurance_company.id,
          category: policyType.category.name,
          premium: parseFloat(policyType.base_premium),
          coverage: policyType.max_coverage_amount ? parseFloat(policyType.max_coverage_amount) : 0,
          description: policyType.description,
        })
      } catch (error) {
        console.error('Error loading policy:', error)
        toast.error('Failed to load policy details')
      }
    }

    loadProduct()

    // Restore saved form data if returning from login
    const savedFormData = sessionStorage.getItem('purchase_form_data')
    const savedPolicyId = sessionStorage.getItem('purchase_policy_id')

    if (savedFormData && savedPolicyId === params.id && isAuthenticated) {
      try {
        const parsed = JSON.parse(savedFormData)
        setFormData(parsed)
        toast.success('Welcome back! Your progress has been restored.')
        sessionStorage.removeItem('purchase_form_data')
        sessionStorage.removeItem('purchase_policy_id')
      } catch (error) {
        console.error('Failed to restore form data:', error)
      }
    } else if (user && !savedFormData) {
      // Pre-fill user data if authenticated and no saved data
      setFormData((prev: any) => ({
        ...prev,
        personal: {
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          idNumber: '',
          dateOfBirth: '',
        }
      }))
    }
  }, [params.id, user, isAuthenticated])

  if (!product) {
    return <div>Loading...</div>
  }

  // Define steps based on product category
  const getSteps = (): PurchaseStep[] => {
    const baseSteps = [
      { id: 'personal', title: 'Personal Information', description: 'Your contact details' }
    ]

    switch (product.category.toLowerCase()) {
      case 'motor':
        return [
          ...baseSteps,
          { id: 'vehicle', title: 'Vehicle Details', description: 'Select or add your vehicle' },
          { id: 'policy', title: 'Policy Details', description: 'Coverage options' },
          { id: 'review', title: 'Review & Submit', description: 'Confirm your details' }
        ]
      case 'medical':
        return [
          ...baseSteps,
          { id: 'medical', title: 'Medical Information', description: 'Health details' },
          { id: 'beneficiaries', title: 'Beneficiaries', description: 'Add beneficiaries' },
          { id: 'policy', title: 'Policy Details', description: 'Coverage options' },
          { id: 'review', title: 'Review & Submit', description: 'Confirm your details' }
        ]
      case 'travel':
        return [
          ...baseSteps,
          { id: 'trip', title: 'Trip Details', description: 'Destination and dates' },
          { id: 'policy', title: 'Policy Details', description: 'Coverage options' },
          { id: 'review', title: 'Review & Submit', description: 'Confirm your details' }
        ]
      case 'home':
        return [
          ...baseSteps,
          { id: 'property', title: 'Property Details', description: 'Property information' },
          { id: 'policy', title: 'Policy Details', description: 'Coverage options' },
          { id: 'review', title: 'Review & Submit', description: 'Confirm your details' }
        ]
      case 'business':
        return [
          ...baseSteps,
          { id: 'business', title: 'Business Details', description: 'Company information' },
          { id: 'policy', title: 'Policy Details', description: 'Coverage options' },
          { id: 'review', title: 'Review & Submit', description: 'Confirm your details' }
        ]
      case 'life':
        return [
          ...baseSteps,
          { id: 'health', title: 'Health Information', description: 'Medical history' },
          { id: 'beneficiaries', title: 'Beneficiaries', description: 'Add beneficiaries' },
          { id: 'policy', title: 'Policy Details', description: 'Coverage options' },
          { id: 'review', title: 'Review & Submit', description: 'Confirm your details' }
        ]
      default:
        return [
          ...baseSteps,
          { id: 'policy', title: 'Policy Details', description: 'Coverage options' },
          { id: 'review', title: 'Review & Submit', description: 'Confirm your details' }
        ]
    }
  }

  const steps = getSteps()

  const handleNext = () => {
    // Validate current step
    if (!validateStep(steps[currentStep].id)) {
      return
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateStep = (stepId: string): boolean => {
    // Add validation logic for each step
    switch (stepId) {
      case 'personal':
        if (!formData.personal?.firstName || !formData.personal?.lastName || !formData.personal?.email || !formData.personal?.phone) {
          toast.error('Please fill in all required personal information')
          return false
        }
        break
      case 'vehicle':
        if (!formData.vehicle?.selectedVehicle && !formData.vehicle?.newVehicle) {
          toast.error('Please select or add a vehicle')
          return false
        }
        break
      // Add more validation as needed
    }
    return true
  }

  const handleSubmit = async () => {
    // Check authentication before submitting
    if (!isAuthenticated) {
      toast.error('Please login to purchase insurance')
      // Save current progress to sessionStorage
      sessionStorage.setItem('purchase_form_data', JSON.stringify(formData))
      sessionStorage.setItem('purchase_policy_id', params.id as string)
      router.push(`/login?redirect=/purchase/${params.id}`)
      return
    }

    try {
      // Calculate dates
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + 1) // Start tomorrow
      const endDate = new Date(startDate)

      // Set end date based on payment frequency
      const frequency = formData.payment?.frequency || 'annually'
      if (frequency === 'annually') {
        endDate.setFullYear(endDate.getFullYear() + 1)
      } else if (frequency === 'quarterly') {
        endDate.setMonth(endDate.getMonth() + 3)
      } else {
        endDate.setMonth(endDate.getMonth() + 1)
      }

      // Prepare policy data based on category
      let policyData: any = {}
      if (formData.vehicle) {
        policyData = {
          vehicle_details: {
            make: formData.vehicle.make,
            model: formData.vehicle.model,
            year: parseInt(formData.vehicle.year),
            registration: formData.vehicle.registration,
            value: parseFloat(formData.vehicle.value)
          }
        }
      }

      // Prepare beneficiaries if any
      const beneficiaries = formData.beneficiaries?.map((b: any) => ({
        name: b.name,
        relationship: b.relationship,
        phone_number: b.phone,
        percentage: parseFloat(b.percentage)
      })) || []

      // Purchase the policy
      const purchaseData = {
        policy_type: product.id,
        insurance_company: product.companyId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        premium_amount: product.premium.toString(),
        coverage_amount: (formData.coverage?.amount || product.coverage).toString(),
        payment_frequency: frequency,
        policy_data: policyData,
        beneficiaries: beneficiaries.length > 0 ? beneficiaries : undefined
      }

      toast.loading('Creating your policy...')
      const policy = await purchasePolicy(purchaseData)

      toast.success('Policy created! Redirecting to payment...')

      // Clear saved form data
      sessionStorage.removeItem('purchase_form_data')
      sessionStorage.removeItem('purchase_policy_id')

      // Redirect to payment page
      setTimeout(() => {
        router.push(`/payment/${policy.id}`)
      }, 1000)

    } catch (error: any) {
      console.error('Error purchasing policy:', error)

      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.')
        // Save current progress
        sessionStorage.setItem('purchase_form_data', JSON.stringify(formData))
        sessionStorage.setItem('purchase_policy_id', params.id as string)
        router.push(`/login?redirect=/purchase/${params.id}`)
      } else {
        toast.error(error.response?.data?.message || 'Failed to purchase policy. Please try again.')
      }
    }
  }

  const updateFormData = (section: string, data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }

  const renderStepContent = () => {
    const stepId = steps[currentStep].id

    switch (stepId) {
      case 'personal':
        return <PersonalInfoStep data={formData.personal} onChange={(data: any) => updateFormData('personal', data)} />

      case 'vehicle':
        return <VehicleStep data={formData.vehicle} onChange={(data: any) => updateFormData('vehicle', data)} />

      case 'medical':
        return <MedicalInfoStep data={formData.medical} onChange={(data: any) => updateFormData('medical', data)} />

      case 'trip':
        return <TripDetailsStep data={formData.trip} onChange={(data: any) => updateFormData('trip', data)} />

      case 'property':
        return <PropertyStep data={formData.property} onChange={(data: any) => updateFormData('property', data)} />

      case 'business':
        return <BusinessStep data={formData.business} onChange={(data: any) => updateFormData('business', data)} />

      case 'health':
        return <HealthInfoStep data={formData.health} onChange={(data: any) => updateFormData('health', data)} />

      case 'beneficiaries':
        return <BeneficiariesStep data={formData.beneficiaries} onChange={(data: any) => updateFormData('beneficiaries', data)} />

      case 'policy':
        return <PolicyDetailsStep data={formData.policy} onChange={(data: any) => updateFormData('policy', data)} product={product} />

      case 'review':
        return <ReviewStep formData={formData} product={product} steps={steps} />

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/policies/details/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Policy
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Authentication Notice */}
          {!isAuthenticated && (
            <Card className="mb-6 border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Login Required</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      You can fill out the application form, but you'll need to login before submitting your purchase.
                    </p>
                    <Button size="sm" onClick={() => {
                      sessionStorage.setItem('purchase_form_data', JSON.stringify(formData))
                      sessionStorage.setItem('purchase_policy_id', params.id as string)
                      router.push(`/login?redirect=/purchase/${params.id}`)
                    }}>
                      Login Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Info */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{product.name}</h2>
                    <p className="text-sm text-muted-foreground">{product.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">KES {product.premium.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                        index < currentStep
                          ? 'bg-primary text-primary-foreground'
                          : index === currentStep
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                    </div>
                    <div className="mt-2 text-center hidden md:block">
                      <div className={`text-xs font-medium ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all ${
                        index < currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="md:hidden text-center">
              <div className="text-sm font-medium">{steps[currentStep].title}</div>
              <div className="text-xs text-muted-foreground">{steps[currentStep].description}</div>
            </div>
          </div>

          {/* Step Content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} size="lg">
                Submit Application
                <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Step Components

function PersonalInfoStep({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={data?.firstName || ''}
            onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="Enter your first name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={data?.lastName || ''}
            onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="Enter your last name"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={data?.email || ''}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="your@email.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={data?.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+254 700 000 000"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="idNumber">ID Number *</Label>
          <Input
            id="idNumber"
            value={data?.idNumber || ''}
            onChange={(e) => onChange({ idNumber: e.target.value })}
            placeholder="Enter your ID number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data?.dateOfBirth || ''}
            onChange={(e) => onChange({ dateOfBirth: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

function VehicleStep({ data, onChange }: any) {
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false)

  return (
    <div className="space-y-6">
      {!showNewVehicleForm ? (
        <>
          <div>
            <h3 className="font-semibold mb-3">Select from Saved Vehicles</h3>
            <div className="space-y-3">
              {savedVehicles.map((vehicle) => (
                <label
                  key={vehicle.id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    data?.selectedVehicle === vehicle.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="vehicle"
                      value={vehicle.id}
                      checked={data?.selectedVehicle === vehicle.id}
                      onChange={(e) => onChange({ selectedVehicle: e.target.value, newVehicle: null })}
                      className="w-4 h-4"
                    />
                    <Car className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {vehicle.registration} • KES {vehicle.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowNewVehicleForm(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Vehicle
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Add New Vehicle</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowNewVehicleForm(false)}>
              Select Saved Vehicle
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Vehicle Make *</Label>
                <Input
                  id="make"
                  value={data?.newVehicle?.make || ''}
                  onChange={(e) => onChange({ newVehicle: { ...data?.newVehicle, make: e.target.value }, selectedVehicle: null })}
                  placeholder="e.g., Toyota"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Vehicle Model *</Label>
                <Input
                  id="model"
                  value={data?.newVehicle?.model || ''}
                  onChange={(e) => onChange({ newVehicle: { ...data?.newVehicle, model: e.target.value }, selectedVehicle: null })}
                  placeholder="e.g., Land Cruiser"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={data?.newVehicle?.year || ''}
                  onChange={(e) => onChange({ newVehicle: { ...data?.newVehicle, year: e.target.value }, selectedVehicle: null })}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration">Registration *</Label>
                <Input
                  id="registration"
                  value={data?.newVehicle?.registration || ''}
                  onChange={(e) => onChange({ newVehicle: { ...data?.newVehicle, registration: e.target.value }, selectedVehicle: null })}
                  placeholder="KCE 123A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Vehicle Value (KES) *</Label>
                <Input
                  id="value"
                  type="number"
                  value={data?.newVehicle?.value || ''}
                  onChange={(e) => onChange({ newVehicle: { ...data?.newVehicle, value: e.target.value }, selectedVehicle: null })}
                  placeholder="8500000"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MedicalInfoStep({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Do you have any pre-existing medical conditions? *</Label>
        <RadioGroup
          value={data?.hasConditions || 'no'}
          onValueChange={(value) => onChange({ hasConditions: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no-conditions" />
            <Label htmlFor="no-conditions" className="font-normal cursor-pointer">No</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="yes-conditions" />
            <Label htmlFor="yes-conditions" className="font-normal cursor-pointer">Yes</Label>
          </div>
        </RadioGroup>
      </div>

      {data?.hasConditions === 'yes' && (
        <div className="space-y-2">
          <Label htmlFor="conditions">Please describe *</Label>
          <Textarea
            id="conditions"
            value={data?.conditionsDescription || ''}
            onChange={(e) => onChange({ conditionsDescription: e.target.value })}
            placeholder="Describe your medical conditions"
            rows={4}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="height">Height (cm) *</Label>
        <Input
          id="height"
          type="number"
          value={data?.height || ''}
          onChange={(e) => onChange({ height: e.target.value })}
          placeholder="170"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight">Weight (kg) *</Label>
        <Input
          id="weight"
          type="number"
          value={data?.weight || ''}
          onChange={(e) => onChange({ weight: e.target.value })}
          placeholder="70"
        />
      </div>

      <div className="space-y-2">
        <Label>Do you smoke? *</Label>
        <RadioGroup
          value={data?.smoker || 'no'}
          onValueChange={(value) => onChange({ smoker: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="non-smoker" />
            <Label htmlFor="non-smoker" className="font-normal cursor-pointer">No</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="smoker" />
            <Label htmlFor="smoker" className="font-normal cursor-pointer">Yes</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}

function TripDetailsStep({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="destination">Destination Country *</Label>
        <Input
          id="destination"
          value={data?.destination || ''}
          onChange={(e) => onChange({ destination: e.target.value })}
          placeholder="e.g., United Kingdom"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departureDate">Departure Date *</Label>
          <Input
            id="departureDate"
            type="date"
            value={data?.departureDate || ''}
            onChange={(e) => onChange({ departureDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="returnDate">Return Date *</Label>
          <Input
            id="returnDate"
            type="date"
            value={data?.returnDate || ''}
            onChange={(e) => onChange({ returnDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose of Travel *</Label>
        <Select value={data?.purpose || ''} onValueChange={(value) => onChange({ purpose: value })}>
          <SelectTrigger id="purpose">
            <SelectValue placeholder="Select purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tourism">Tourism/Leisure</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="medical">Medical Treatment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="travelers">Number of Travelers *</Label>
        <Input
          id="travelers"
          type="number"
          min="1"
          value={data?.travelers || '1'}
          onChange={(e) => onChange({ travelers: e.target.value })}
        />
      </div>
    </div>
  )
}

function PropertyStep({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="propertyType">Property Type *</Label>
        <Select value={data?.propertyType || ''} onValueChange={(value) => onChange({ propertyType: value })}>
          <SelectTrigger id="propertyType">
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="condo">Condominium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Property Address *</Label>
        <Textarea
          id="address"
          value={data?.address || ''}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Enter full property address"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="propertyValue">Property Value (KES) *</Label>
          <Input
            id="propertyValue"
            type="number"
            value={data?.propertyValue || ''}
            onChange={(e) => onChange({ propertyValue: e.target.value })}
            placeholder="15000000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contentsValue">Contents Value (KES) *</Label>
          <Input
            id="contentsValue"
            type="number"
            value={data?.contentsValue || ''}
            onChange={(e) => onChange({ contentsValue: e.target.value })}
            placeholder="2000000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Is this property owner-occupied? *</Label>
        <RadioGroup
          value={data?.ownerOccupied || 'yes'}
          onValueChange={(value) => onChange({ ownerOccupied: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="owner-yes" />
            <Label htmlFor="owner-yes" className="font-normal cursor-pointer">Yes, I live here</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="owner-no" />
            <Label htmlFor="owner-no" className="font-normal cursor-pointer">No, it's rented out</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}

function BusinessStep({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name *</Label>
        <Input
          id="businessName"
          value={data?.businessName || ''}
          onChange={(e) => onChange({ businessName: e.target.value })}
          placeholder="Enter your business name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Business Registration Number *</Label>
          <Input
            id="registrationNumber"
            value={data?.registrationNumber || ''}
            onChange={(e) => onChange({ registrationNumber: e.target.value })}
            placeholder="Enter registration number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <Select value={data?.industry || ''} onValueChange={(value) => onChange({ industry: value })}>
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="hospitality">Hospitality</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="services">Professional Services</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessAddress">Business Address *</Label>
        <Textarea
          id="businessAddress"
          value={data?.businessAddress || ''}
          onChange={(e) => onChange({ businessAddress: e.target.value })}
          placeholder="Enter business address"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employees">Number of Employees *</Label>
          <Input
            id="employees"
            type="number"
            value={data?.employees || ''}
            onChange={(e) => onChange({ employees: e.target.value })}
            placeholder="10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="annualRevenue">Annual Revenue (KES) *</Label>
          <Input
            id="annualRevenue"
            type="number"
            value={data?.annualRevenue || ''}
            onChange={(e) => onChange({ annualRevenue: e.target.value })}
            placeholder="5000000"
          />
        </div>
      </div>
    </div>
  )
}

function HealthInfoStep({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Have you ever been diagnosed with any serious illness? *</Label>
        <RadioGroup
          value={data?.seriousIllness || 'no'}
          onValueChange={(value) => onChange({ seriousIllness: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no-illness" />
            <Label htmlFor="no-illness" className="font-normal cursor-pointer">No</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="yes-illness" />
            <Label htmlFor="yes-illness" className="font-normal cursor-pointer">Yes</Label>
          </div>
        </RadioGroup>
      </div>

      {data?.seriousIllness === 'yes' && (
        <div className="space-y-2">
          <Label htmlFor="illnessDetails">Please provide details *</Label>
          <Textarea
            id="illnessDetails"
            value={data?.illnessDetails || ''}
            onChange={(e) => onChange({ illnessDetails: e.target.value })}
            placeholder="Describe your medical history"
            rows={4}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Are you currently taking any medication? *</Label>
        <RadioGroup
          value={data?.medication || 'no'}
          onValueChange={(value) => onChange({ medication: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no-meds" />
            <Label htmlFor="no-meds" className="font-normal cursor-pointer">No</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="yes-meds" />
            <Label htmlFor="yes-meds" className="font-normal cursor-pointer">Yes</Label>
          </div>
        </RadioGroup>
      </div>

      {data?.medication === 'yes' && (
        <div className="space-y-2">
          <Label htmlFor="medicationDetails">List all medications *</Label>
          <Textarea
            id="medicationDetails"
            value={data?.medicationDetails || ''}
            onChange={(e) => onChange({ medicationDetails: e.target.value })}
            placeholder="List medication names and dosages"
            rows={4}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="occupation">Occupation *</Label>
        <Input
          id="occupation"
          value={data?.occupation || ''}
          onChange={(e) => onChange({ occupation: e.target.value })}
          placeholder="Enter your occupation"
        />
      </div>
    </div>
  )
}

function BeneficiariesStep({ data, onChange }: any) {
  const [beneficiaries, setBeneficiaries] = useState(data?.list || [{ name: '', relationship: '', percentage: '' }])

  const updateBeneficiary = (index: number, field: string, value: string) => {
    const updated = [...beneficiaries]
    updated[index] = { ...updated[index], [field]: value }
    setBeneficiaries(updated)
    onChange({ list: updated })
  }

  const addBeneficiary = () => {
    const updated = [...beneficiaries, { name: '', relationship: '', percentage: '' }]
    setBeneficiaries(updated)
    onChange({ list: updated })
  }

  const removeBeneficiary = (index: number) => {
    const updated = beneficiaries.filter((_: any, i: number) => i !== index)
    setBeneficiaries(updated)
    onChange({ list: updated })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add people who will receive benefits from this policy. Total percentage must equal 100%.
      </p>

      {beneficiaries.map((beneficiary: any, index: number) => (
        <div key={index} className="p-4 border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Beneficiary {index + 1}</h4>
            {beneficiaries.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeBeneficiary(index)}
                className="text-red-500"
              >
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={beneficiary.name}
                onChange={(e) => updateBeneficiary(index, 'name', e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label>Relationship *</Label>
              <Select
                value={beneficiary.relationship}
                onValueChange={(value) => updateBeneficiary(index, 'relationship', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Percentage (%) *</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={beneficiary.percentage}
                onChange={(e) => updateBeneficiary(index, 'percentage', e.target.value)}
                placeholder="50"
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addBeneficiary} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Beneficiary
      </Button>

      {beneficiaries.length > 0 && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Allocation:</span>
            <span className={`text-lg font-bold ${
              beneficiaries.reduce((sum: number, b: any) => sum + (parseInt(b.percentage) || 0), 0) === 100
                ? 'text-green-500'
                : 'text-red-500'
            }`}>
              {beneficiaries.reduce((sum: number, b: any) => sum + (parseInt(b.percentage) || 0), 0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function PolicyDetailsStep({ data, onChange, product }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="startDate">Policy Start Date *</Label>
        <Input
          id="startDate"
          type="date"
          value={data?.startDate || ''}
          onChange={(e) => onChange({ startDate: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Policy Duration *</Label>
        <Select value={data?.duration || '12'} onValueChange={(value) => onChange({ duration: value })}>
          <SelectTrigger id="duration">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12 Months</SelectItem>
            <SelectItem value="6">6 Months</SelectItem>
            <SelectItem value="3">3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentPlan">Payment Plan *</Label>
        <Select value={data?.paymentPlan || 'monthly'} onValueChange={(value) => onChange({ paymentPlan: value })}>
          <SelectTrigger id="paymentPlan">
            <SelectValue placeholder="Select payment plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly (5% discount)</SelectItem>
            <SelectItem value="annual">Annual (10% discount)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 bg-muted rounded-lg space-y-2">
        <div className="flex justify-between">
          <span>Base Premium:</span>
          <span className="font-semibold">KES {product.premium.toLocaleString()}/month</span>
        </div>
        <div className="flex justify-between">
          <span>Duration:</span>
          <span className="font-semibold">{data?.duration || 12} months</span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-bold">Total Annual Premium:</span>
          <span className="font-bold text-primary">
            KES {(product.premium * (parseInt(data?.duration || '12'))).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

function ReviewStep({ formData, product, steps }: any) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Review Your Application</h4>
            <p className="text-sm text-muted-foreground">
              Please review all the information below carefully before submitting your application.
              You will be contacted shortly after submission for verification and payment.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      {formData.personal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{formData.personal.firstName} {formData.personal.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{formData.personal.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{formData.personal.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID Number</p>
                <p className="font-medium">{formData.personal.idNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Details */}
      {formData.vehicle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="h-5 w-5" />
              Vehicle Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.vehicle.selectedVehicle && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Selected Vehicle</p>
                <p className="font-medium">
                  {savedVehicles.find(v => v.id === formData.vehicle.selectedVehicle)?.make}{' '}
                  {savedVehicles.find(v => v.id === formData.vehicle.selectedVehicle)?.model} (
                  {savedVehicles.find(v => v.id === formData.vehicle.selectedVehicle)?.registration})
                </p>
              </div>
            )}
            {formData.vehicle.newVehicle && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-medium">
                    {formData.vehicle.newVehicle.year} {formData.vehicle.newVehicle.make} {formData.vehicle.newVehicle.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration</p>
                  <p className="font-medium">{formData.vehicle.newVehicle.registration}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Policy Details */}
      {formData.policy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Policy Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{formData.policy.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{formData.policy.duration} months</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Plan</p>
                <p className="font-medium capitalize">{formData.policy.paymentPlan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Premium</p>
                <p className="font-medium">KES {product.premium.toLocaleString()}/month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Total Annual Premium:</span>
          <span className="text-2xl font-bold text-primary">
            KES {(product.premium * (parseInt(formData.policy?.duration || '12'))).toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Payment will be processed after your application is approved
        </p>
      </div>
    </div>
  )
}
