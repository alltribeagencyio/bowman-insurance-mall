'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Upload } from 'lucide-react'

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
    alert('Claim submitted successfully! Our team will review it within 24-48 hours.')
    router.push('/claims')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Claims
          </Button>
          <h1 className="text-4xl font-bold mb-2">File a New Claim</h1>
          <p className="text-muted-foreground text-lg">
            Submit your insurance claim with all required details
          </p>
        </div>
      </section>

      {/* Claim Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
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
                        <label className="text-sm font-medium mb-2 block">
                          Policy Number *
                        </label>
                        <Input
                          type="text"
                          placeholder="POL-2024-001"
                          value={formData.policyNumber}
                          onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Claim Type *
                        </label>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          value={formData.claimType}
                          onChange={(e) => setFormData({ ...formData, claimType: e.target.value })}
                          required
                        >
                          <option value="">Select type</option>
                          <option value="motor">Motor Accident</option>
                          <option value="medical">Medical/Health</option>
                          <option value="life">Life Insurance</option>
                          <option value="home">Home/Property</option>
                          <option value="travel">Travel</option>
                          <option value="business">Business</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Incident Details */}
                  <div>
                    <h3 className="font-semibold mb-4">Incident Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Date of Incident *
                        </label>
                        <Input
                          type="date"
                          value={formData.incidentDate}
                          onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Location of Incident *
                        </label>
                        <Input
                          type="text"
                          placeholder="City, Area"
                          value={formData.incidentLocation}
                          onChange={(e) => setFormData({ ...formData, incidentLocation: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-medium mb-2 block">
                        Detailed Description *
                      </label>
                      <textarea
                        className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background"
                        placeholder="Describe what happened in detail..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Estimated Claim Amount (KES) *
                      </label>
                      <Input
                        type="number"
                        placeholder="50000"
                        value={formData.estimatedAmount}
                        onChange={(e) => setFormData({ ...formData, estimatedAmount: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Supporting Documents */}
                  <div>
                    <h3 className="font-semibold mb-4">Supporting Documents</h3>
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload photos, receipts, police reports, or other relevant documents
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        Choose Files
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Accepted formats: PDF, JPG, PNG (Max 5MB per file)
                      </p>
                    </div>
                  </div>

                  {/* Declaration */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1" required />
                      <span className="text-sm">
                        I declare that the information provided is true and accurate to the best of my knowledge.
                        I understand that providing false information may result in claim rejection.
                      </span>
                    </label>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Submit Claim
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
