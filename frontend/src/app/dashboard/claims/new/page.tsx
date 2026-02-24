'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Upload, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { submitClaim, uploadFileToS3, uploadClaimDocument, type ClaimSubmitInput, type ClaimDocumentInput } from '@/lib/api/claims'
import { getUserPolicies, type Policy } from '@/lib/api/policies'

interface UploadedFile {
  file: File
  title: string
  documentType: string
  uploading: boolean
  progress: number
  url?: string
}

export default function NewClaimPage() {
  const router = useRouter()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loadingPolicies, setLoadingPolicies] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const [formData, setFormData] = useState({
    policy: '',
    claimType: '',
    incidentDate: '',
    incidentLocation: '',
    description: '',
    estimatedAmount: '',
  })

  // Fetch user policies on mount
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoadingPolicies(true)
        const data = await getUserPolicies()
        // Filter only active policies
        const activePolicies = data.filter(p => p.status === 'active')
        setPolicies(activePolicies)
      } catch (error) {
        console.error('Error fetching policies:', error)
        toast.error('Failed to load policies. Please try again.')
      } finally {
        setLoadingPolicies(false)
      }
    }

    fetchPolicies()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      title: file.name,
      documentType: 'other',
      uploading: false,
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const updateFileMetadata = (index: number, field: 'title' | 'documentType', value: string) => {
    setUploadedFiles(prev => prev.map((file, i) =>
      i === index ? { ...file, [field]: value } : file
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.policy) {
      toast.error('Please select a policy')
      return
    }

    try {
      setIsSubmitting(true)

      // Submit the claim
      const claimData: ClaimSubmitInput = {
        policy: formData.policy,
        type: formData.claimType,
        description: formData.description,
        incident_date: formData.incidentDate,
        incident_location: formData.incidentLocation,
        amount_claimed: formData.estimatedAmount || '0'
      }

      const claim = await submitClaim(claimData)

      // Upload files if any
      if (uploadedFiles.length > 0) {
        toast.info('Uploading documents...')

        for (let i = 0; i < uploadedFiles.length; i++) {
          const fileData = uploadedFiles[i]

          // Update UI to show uploading
          setUploadedFiles(prev => prev.map((f, idx) =>
            idx === i ? { ...f, uploading: true } : f
          ))

          try {
            // Upload file to S3
            const uploadResult = await uploadFileToS3(fileData.file, (progress) => {
              setUploadedFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, progress } : f
              ))
            })

            // Attach document to claim
            await uploadClaimDocument(claim.id, {
              document_type: fileData.documentType as ClaimDocumentInput['document_type'],
              title: fileData.title,
              file_url: uploadResult.file_url,
              file_size: uploadResult.file_size,
              mime_type: uploadResult.mime_type
            })

            setUploadedFiles(prev => prev.map((f, idx) =>
              idx === i ? { ...f, uploading: false, url: uploadResult.file_url } : f
            ))
          } catch (error) {
            console.error('Error uploading file:', error)
            toast.error(`Failed to upload ${fileData.title}`)
          }
        }
      }

      toast.success('Claim submitted successfully! Our team will review it within 24-48 hours.')
      router.push('/dashboard/claims')
    } catch (error) {
      console.error('Error submitting claim:', error)
      toast.error('Failed to submit claim. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
                  <Label htmlFor="policy">Select Policy *</Label>
                  {loadingPolicies ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading policies...
                    </div>
                  ) : policies.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-2">
                      No active policies found. <Link href="/policies" className="text-primary hover:underline">Browse policies</Link>
                    </div>
                  ) : (
                    <Select
                      value={formData.policy}
                      onValueChange={(value) => setFormData({ ...formData, policy: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        {policies.map((policy) => (
                          <SelectItem key={policy.id} value={policy.id}>
                            {policy.policy_number} - {policy.policy_type_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label htmlFor="claimType">Claim Type *</Label>
                  <Select
                    value={formData.claimType}
                    onValueChange={(value) => setFormData({ ...formData, claimType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accident">Accident</SelectItem>
                      <SelectItem value="theft">Theft</SelectItem>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
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
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="file-upload">
                <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, PNG, JPG up to 10MB
                  </p>
                </div>
              </label>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <Input
                            value={file.title}
                            onChange={(e) => updateFileMetadata(index, 'title', e.target.value)}
                            placeholder="Document title"
                            className="mb-2"
                            disabled={file.uploading}
                          />
                          <Select
                            value={file.documentType}
                            onValueChange={(value) => updateFileMetadata(index, 'documentType', value)}
                            disabled={file.uploading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Document type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="photos">Photos</SelectItem>
                              <SelectItem value="police_report">Police Report</SelectItem>
                              <SelectItem value="medical_report">Medical Report</SelectItem>
                              <SelectItem value="repair_estimate">Repair Estimate</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {file.uploading && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${file.progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Uploading... {file.progress}%
                              </p>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          disabled={file.uploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loadingPolicies || policies.length === 0}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Claim'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
