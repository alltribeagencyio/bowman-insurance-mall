'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Trash2,
  Mail,
  FolderOpen,
  File,
  Image,
  FileCheck
} from 'lucide-react'
import { toast } from 'sonner'
import { ProtectedRoute } from '@/components/auth/protected-route'

interface Document {
  id: string
  name: string
  type: 'certificate' | 'receipt' | 'id' | 'claim' | 'other'
  file_type: string
  size: number
  policy_number?: string
  uploaded_date: string
  verified: boolean
}

// Mock data
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Motor Insurance Certificate',
    type: 'certificate',
    file_type: 'PDF',
    size: 245600,
    policy_number: 'POL-2026-001234',
    uploaded_date: '2026-01-15T10:30:00Z',
    verified: true
  },
  {
    id: '2',
    name: 'Premium Payment Receipt',
    type: 'receipt',
    file_type: 'PDF',
    size: 128000,
    policy_number: 'POL-2026-001234',
    uploaded_date: '2026-01-15T14:20:00Z',
    verified: true
  },
  {
    id: '3',
    name: 'National ID Copy',
    type: 'id',
    file_type: 'JPG',
    size: 512000,
    uploaded_date: '2026-01-10T09:15:00Z',
    verified: true
  },
  {
    id: '4',
    name: 'Medical Insurance Certificate',
    type: 'certificate',
    file_type: 'PDF',
    size: 298000,
    policy_number: 'POL-2026-001235',
    uploaded_date: '2026-01-20T11:45:00Z',
    verified: true
  },
  {
    id: '5',
    name: 'Vehicle Registration',
    type: 'other',
    file_type: 'PDF',
    size: 189000,
    uploaded_date: '2026-01-12T16:30:00Z',
    verified: false
  }
]

function DocumentsContent() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const getDocumentIcon = (type: string, file_type: string) => {
    if (file_type.toLowerCase().includes('jpg') || file_type.toLowerCase().includes('png')) {
      return <Image className="w-8 h-8 text-blue-500" />
    }
    switch (type) {
      case 'certificate':
        return <FileCheck className="w-8 h-8 text-green-500" />
      case 'receipt':
        return <FileText className="w-8 h-8 text-purple-500" />
      case 'id':
        return <File className="w-8 h-8 text-amber-500" />
      default:
        return <FileText className="w-8 h-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleUpload = () => {
    toast.success('Upload dialog will open')
    // TODO: Implement file upload
  }

  const handleDownload = (docId: string, docName: string) => {
    toast.success(`Downloading ${docName}`)
    // TODO: Implement actual download
  }

  const handlePreview = (docId: string) => {
    toast.success('Preview will open')
    // TODO: Implement preview modal
  }

  const handleEmail = (docId: string) => {
    toast.success('Document sent to your email')
    // TODO: Implement email functionality
  }

  const handleDelete = (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== docId))
      toast.success('Document deleted')
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.policy_number?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType =
      typeFilter === 'all' || doc.type === typeFilter

    return matchesSearch && matchesType
  })

  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = []
    acc[doc.type].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  const documentTypeLabels: Record<string, string> = {
    certificate: 'Certificates',
    receipt: 'Receipts',
    id: 'ID Documents',
    claim: 'Claim Documents',
    other: 'Other Documents'
  }

  const stats = {
    total: documents.length,
    certificates: documents.filter(d => d.type === 'certificate').length,
    receipts: documents.filter(d => d.type === 'receipt').length,
    verified: documents.filter(d => d.verified).length
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Documents Hub</h1>
          <p className="text-muted-foreground">
            Manage all your insurance documents in one place
          </p>
        </div>
        <Button onClick={handleUpload} size="lg">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <FileCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates}</div>
            <p className="text-xs text-muted-foreground">
              Policy certificates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipts</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.receipts}</div>
            <p className="text-xs text-muted-foreground">
              Payment receipts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">
              Verified documents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents by name or policy number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Types</option>
                <option value="certificate">Certificates</option>
                <option value="receipt">Receipts</option>
                <option value="id">ID Documents</option>
                <option value="claim">Claims</option>
                <option value="other">Other</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List - Grouped by Type */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Upload your first document to get started'}
            </p>
            <Button onClick={handleUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([type, docs]) => (
            <div key={type}>
              <h2 className="text-xl font-semibold mb-4">
                {documentTypeLabels[type] || type}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({docs.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          {getDocumentIcon(doc.type, doc.file_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate mb-1">{doc.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{doc.file_type}</span>
                            <span>•</span>
                            <span>{formatFileSize(doc.size)}</span>
                          </div>
                          {doc.verified && (
                            <Badge variant="outline" className="mt-1">
                              <FileCheck className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      {doc.policy_number && (
                        <div className="mb-3 text-sm">
                          <span className="text-muted-foreground">Policy: </span>
                          <span className="font-mono text-xs">{doc.policy_number}</span>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mb-4">
                        Uploaded {new Date(doc.uploaded_date).toLocaleDateString()}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(doc.id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc.id, doc.name)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmail(doc.id)}
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Tips */}
      <Card className="mt-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-base text-blue-900 dark:text-blue-100">
            Document Upload Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>• Accepted formats: PDF, JPG, PNG (max 5MB per file)</p>
          <p>• Ensure documents are clear and readable</p>
          <p>• Include policy number in filename for easy reference</p>
          <p>• Documents are encrypted and securely stored</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <DocumentsContent />
    </ProtectedRoute>
  )
}
