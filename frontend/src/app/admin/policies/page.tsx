'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, Edit, Trash2, Upload, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function PoliciesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const policyTypes = [
    { id: '1', name: 'Motor - Comprehensive', category: 'Motor', active: true, policies_count: 450 },
    { id: '2', name: 'Motor - Third Party', category: 'Motor', active: true, policies_count: 320 },
    { id: '3', name: 'Home Insurance', category: 'Property', active: true, policies_count: 180 },
    { id: '4', name: 'Travel Insurance', category: 'Travel', active: true, policies_count: 95 },
  ]

  const companies = [
    { id: '1', name: 'Jubilee Insurance', policies: 380, commission: 15, active: true },
    { id: '2', name: 'CIC Insurance', policies: 295, commission: 12, active: true },
    { id: '3', name: 'APA Insurance', policies: 240, commission: 14, active: true },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Policy Management</h1>
        <p className="text-muted-foreground mt-1">Manage policy types, user policies, and insurance companies</p>
      </div>

      <Tabs defaultValue="types" className="space-y-6">
        <TabsList>
          <TabsTrigger value="types">Policy Types</TabsTrigger>
          <TabsTrigger value="user-policies">User Policies</TabsTrigger>
          <TabsTrigger value="companies">Insurance Companies</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Policy Types</CardTitle>
                  <CardDescription>Manage available insurance policy types</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Bulk Upload</Button>
                  <Button><Plus className="h-4 w-4 mr-2" />Add Policy Type</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Policy Name</th>
                      <th className="text-left p-4 font-medium">Category</th>
                      <th className="text-left p-4 font-medium">Active Policies</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyTypes.map((type) => (
                      <tr key={type.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{type.name}</td>
                        <td className="p-4">{type.category}</td>
                        <td className="p-4">{type.policies_count}</td>
                        <td className="p-4">
                          <Badge>{type.active ? 'Active' : 'Inactive'}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Policies</CardTitle>
              <CardDescription>All customer insurance policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">User policies interface - showing filtered list of all customer policies with approval actions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Insurance Companies</CardTitle>
                  <CardDescription>Manage insurance company partners</CardDescription>
                </div>
                <Button><Plus className="h-4 w-4 mr-2" />Add Company</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Company Name</th>
                      <th className="text-left p-4 font-medium">Active Policies</th>
                      <th className="text-left p-4 font-medium">Commission %</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{company.name}</td>
                        <td className="p-4">{company.policies}</td>
                        <td className="p-4">{company.commission}%</td>
                        <td className="p-4">
                          <Badge>{company.active ? 'Active' : 'Inactive'}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
