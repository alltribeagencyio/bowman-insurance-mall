'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Upload } from 'lucide-react'
import { toast } from 'sonner'

export default function NewClaimPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    policyNumber: '',
    claimType: '',
    incidentDate: '',
    incidentLocation: '',
    description: '',
    estimatedAmount: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement claim submission
    console.log('Claim submitted:', formData)
    toast.success('Claim submitted successfully! Our team will review it within 24-48 hours.')
    router.push('/dashboard/claims')
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/claims">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Claims
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">File a New Claim</h1>
        <p className="text-muted-foreground">
          Submit your insurance claim with all required details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claim Information</CardTitle>
          <CardDescription>
            Please provide accurate information to help us process your claim quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Policy Information */}
            <div>
              <h3 className="font-semibold mb-4">Policy Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="policyNumber">Policy Number *</Label>
                  <Input
                    id="policyNumber"
                    type="text"
                    placeholder="POL-2024-001"
                    value={formData.policyNumber}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="claimType">Claim Type *</Label>
                  <Select
                    value={formData.claimType}
                    onValueChange={(value) => setFormData({ ...formData, claimType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accident">Accident</SelectItem>
                      <SelectItem value="theft">Theft</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="damage">Property Damage</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div>
              <h3 className="font-semibold mb-4">Incident Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incidentDate">Incident Date *</Label>
                  <Input
                    id="incidentDate"
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="incidentLocation">Location *</Label>
                  <Input
                    id="incidentLocation"
                    type="text"
                    placeholder="Nairobi, Kenya"
                    value={formData.incidentLocation}
                    onChange={(e) => setFormData({ ...formData, incidentLocation: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Provide detailed description of the incident..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* Estimated Amount */}
            <div>
              <Label htmlFor="estimatedAmount">Estimated Claim Amount (KES)</Label>
              <Input
                id="estimatedAmount"
                type="number"
                placeholder="50000"
                value={formData.estimatedAmount}
                onChange={(e) => setFormData({ ...formData, estimatedAmount: e.target.value })}
              />
            </div>

            {/* Supporting Documents */}
            <div>
              <Label>Supporting Documents</Label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">Submit Claim</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
