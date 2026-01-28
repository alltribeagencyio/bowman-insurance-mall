'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { createBeneficiary, updateBeneficiary, type BeneficiaryInput } from '@/lib/api/beneficiaries'

interface Beneficiary {
  id: string
  name: string
  relationship: string
  percentage: number
  phone: string
  email: string
  is_primary: boolean
}

interface BeneficiaryModalProps {
  isOpen: boolean
  onClose: () => void
  beneficiary?: Beneficiary | null
  onSuccess: () => void
  existingPercentage: number
}

const RELATIONSHIPS = [
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Partner',
  'Other Family',
  'Friend',
  'Other'
]

export function BeneficiaryModal({
  isOpen,
  onClose,
  beneficiary,
  onSuccess,
  existingPercentage
}: BeneficiaryModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<BeneficiaryInput>({
    name: '',
    relationship: '',
    percentage: 0,
    phone: '',
    email: '',
    is_primary: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load beneficiary data when editing
  useEffect(() => {
    if (beneficiary) {
      setFormData({
        name: beneficiary.name,
        relationship: beneficiary.relationship,
        percentage: beneficiary.percentage,
        phone: beneficiary.phone,
        email: beneficiary.email,
        is_primary: beneficiary.is_primary
      })
    } else {
      // Reset form for new beneficiary
      setFormData({
        name: '',
        relationship: '',
        percentage: 0,
        phone: '',
        email: '',
        is_primary: false
      })
    }
    setErrors({})
  }, [beneficiary, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.relationship) {
      newErrors.relationship = 'Relationship is required'
    }

    if (formData.percentage <= 0) {
      newErrors.percentage = 'Percentage must be greater than 0'
    } else if (formData.percentage > 100) {
      newErrors.percentage = 'Percentage cannot exceed 100'
    } else {
      // Check if total allocation exceeds 100%
      const currentBeneficiaryPercentage = beneficiary?.percentage || 0
      const availablePercentage = 100 - existingPercentage + currentBeneficiaryPercentage

      if (formData.percentage > availablePercentage) {
        newErrors.percentage = `Only ${availablePercentage}% available (total cannot exceed 100%)`
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number format'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (beneficiary) {
        // Update existing beneficiary
        await updateBeneficiary(beneficiary.id, formData)
        toast.success('Beneficiary updated successfully')
      } else {
        // Create new beneficiary
        await createBeneficiary(formData)
        toast.success('Beneficiary added successfully')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save beneficiary'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof BeneficiaryInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const currentBeneficiaryPercentage = beneficiary?.percentage || 0
  const availablePercentage = 100 - existingPercentage + currentBeneficiaryPercentage

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {beneficiary ? 'Edit Beneficiary' : 'Add Beneficiary'}
          </DialogTitle>
          <DialogDescription>
            {beneficiary
              ? 'Update the beneficiary information below.'
              : 'Add a new beneficiary to your policies. The total allocation cannot exceed 100%.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Relationship */}
          <div className="space-y-2">
            <Label htmlFor="relationship">
              Relationship <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.relationship}
              onValueChange={(value) => handleInputChange('relationship', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((rel) => (
                  <SelectItem key={rel} value={rel}>
                    {rel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.relationship && (
              <p className="text-sm text-red-500">{errors.relationship}</p>
            )}
          </div>

          {/* Percentage */}
          <div className="space-y-2">
            <Label htmlFor="percentage">
              Allocation Percentage <span className="text-red-500">*</span>
            </Label>
            <Input
              id="percentage"
              type="number"
              min="0"
              max="100"
              step="1"
              value={formData.percentage}
              onChange={(e) => handleInputChange('percentage', parseInt(e.target.value) || 0)}
              placeholder="50"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Available: {availablePercentage}%
            </p>
            {errors.percentage && (
              <p className="text-sm text-red-500">{errors.percentage}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+254712345678"
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Primary Beneficiary */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_primary">Primary Beneficiary</Label>
              <p className="text-xs text-muted-foreground">
                Set as the main beneficiary
              </p>
            </div>
            <Switch
              id="is_primary"
              checked={formData.is_primary}
              onCheckedChange={(checked) => handleInputChange('is_primary', checked)}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : beneficiary ? 'Update' : 'Add'} Beneficiary
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
