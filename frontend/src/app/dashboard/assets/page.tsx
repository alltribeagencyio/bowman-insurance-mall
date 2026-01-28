'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Car,
  Home,
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

// Mock data
const mockVehicles = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2024,
    registration: 'KCE 123A',
    value: 8500000,
    status: 'active',
    insured: true,
    policyNumber: 'POL-2026-001234'
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2022,
    registration: 'KDB 456B',
    value: 3200000,
    status: 'active',
    insured: false
  }
]

const mockProperties = [
  {
    id: '1',
    type: 'House',
    address: '123 Riverside Drive, Nairobi',
    propertyValue: 15000000,
    contentsValue: 2000000,
    ownerOccupied: true,
    insured: true,
    policyNumber: 'POL-2026-005678'
  }
]

const mockBusinesses = [
  {
    id: '1',
    name: 'Tech Solutions Ltd',
    registrationNumber: 'BN-2020-12345',
    industry: 'Technology',
    address: '456 Westlands Avenue, Nairobi',
    employees: 15,
    annualRevenue: 8000000,
    insured: false
  }
]

export default function AssetsPage() {
  const [vehicles, setVehicles] = useState(mockVehicles)
  const [properties, setProperties] = useState(mockProperties)
  const [businesses, setBusinesses] = useState(mockBusinesses)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [showAddBusiness, setShowAddBusiness] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">My Assets</h1>
        <p className="text-muted-foreground mt-2">
          Manage your vehicles, properties, and business assets
        </p>
      </div>

      {/* Assets Tabs */}
      <Tabs defaultValue="vehicles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vehicles" className="gap-2">
            <Car className="h-4 w-4" />
            Vehicles ({vehicles.length})
          </TabsTrigger>
          <TabsTrigger value="properties" className="gap-2">
            <Home className="h-4 w-4" />
            Properties ({properties.length})
          </TabsTrigger>
          <TabsTrigger value="businesses" className="gap-2">
            <Building2 className="h-4 w-4" />
            Businesses ({businesses.length})
          </TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Vehicles</h2>
              <p className="text-sm text-muted-foreground">
                Manage your vehicle information for insurance purposes
              </p>
            </div>
            <Button onClick={() => setShowAddVehicle(!showAddVehicle)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>

          {/* Add Vehicle Form */}
          {showAddVehicle && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Vehicle</CardTitle>
                <CardDescription>Enter your vehicle details</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault()
                  toast.success('Vehicle added successfully')
                  setShowAddVehicle(false)
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Vehicle Make *</Label>
                      <Input id="make" placeholder="e.g., Toyota" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Vehicle Model *</Label>
                      <Input id="model" placeholder="e.g., Land Cruiser" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input id="year" type="number" placeholder="2024" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registration">Registration *</Label>
                      <Input id="registration" placeholder="KCE 123A" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="value">Vehicle Value (KES) *</Label>
                      <Input id="value" type="number" placeholder="8500000" required />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowAddVehicle(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Vehicle</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Vehicles List */}
          <div className="grid grid-cols-1 gap-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          {vehicle.insured ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Insured
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Not Insured
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                          <div>
                            <p className="text-muted-foreground">Registration</p>
                            <p className="font-medium font-mono">{vehicle.registration}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Value</p>
                            <p className="font-medium">KES {vehicle.value.toLocaleString()}</p>
                          </div>
                          {vehicle.insured && (
                            <div className="col-span-2">
                              <p className="text-muted-foreground">Policy Number</p>
                              <p className="font-medium font-mono">{vehicle.policyNumber}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {!vehicle.insured && (
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full md:w-auto">
                        Get Insurance Quote
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {vehicles.length === 0 && !showAddVehicle && (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No vehicles added yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your vehicles to easily manage insurance and get quotes
                </p>
                <Button onClick={() => setShowAddVehicle(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vehicle
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Properties</h2>
              <p className="text-sm text-muted-foreground">
                Manage your property information for insurance purposes
              </p>
            </div>
            <Button onClick={() => setShowAddProperty(!showAddProperty)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>

          {/* Add Property Form */}
          {showAddProperty && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Property</CardTitle>
                <CardDescription>Enter your property details</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault()
                  toast.success('Property added successfully')
                  setShowAddProperty(false)
                }}>
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="condo">Condominium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyAddress">Property Address *</Label>
                    <Textarea id="propertyAddress" placeholder="Enter full property address" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyValue">Property Value (KES) *</Label>
                      <Input id="propertyValue" type="number" placeholder="15000000" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contentsValue">Contents Value (KES) *</Label>
                      <Input id="contentsValue" type="number" placeholder="2000000" required />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowAddProperty(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Property</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Properties List */}
          <div className="grid grid-cols-1 gap-4">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Home className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{property.type}</h3>
                          {property.insured ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Insured
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Not Insured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{property.address}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Property Value</p>
                            <p className="font-medium">KES {property.propertyValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Contents Value</p>
                            <p className="font-medium">KES {property.contentsValue.toLocaleString()}</p>
                          </div>
                          {property.insured && (
                            <div>
                              <p className="text-muted-foreground">Policy Number</p>
                              <p className="font-medium font-mono">{property.policyNumber}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {!property.insured && (
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full md:w-auto">
                        Get Insurance Quote
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {properties.length === 0 && !showAddProperty && (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No properties added yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your properties to easily manage insurance and get quotes
                </p>
                <Button onClick={() => setShowAddProperty(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Businesses Tab */}
        <TabsContent value="businesses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Businesses</h2>
              <p className="text-sm text-muted-foreground">
                Manage your business information for insurance purposes
              </p>
            </div>
            <Button onClick={() => setShowAddBusiness(!showAddBusiness)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </div>

          {/* Add Business Form */}
          {showAddBusiness && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Business</CardTitle>
                <CardDescription>Enter your business details</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault()
                  toast.success('Business added successfully')
                  setShowAddBusiness(false)
                }}>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input id="businessName" placeholder="Enter business name" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="regNumber">Registration Number *</Label>
                      <Input id="regNumber" placeholder="BN-2020-12345" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industryType">Industry *</Label>
                      <Select required>
                        <SelectTrigger>
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
                    <Textarea id="businessAddress" placeholder="Enter business address" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employees">Number of Employees *</Label>
                      <Input id="employees" type="number" placeholder="15" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revenue">Annual Revenue (KES) *</Label>
                      <Input id="revenue" type="number" placeholder="8000000" required />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowAddBusiness(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Business</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Businesses List */}
          <div className="grid grid-cols-1 gap-4">
            {businesses.map((business) => (
              <Card key={business.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{business.name}</h3>
                          {business.insured ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Insured
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Not Insured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{business.address}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Registration</p>
                            <p className="font-medium font-mono">{business.registrationNumber}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Industry</p>
                            <p className="font-medium">{business.industry}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Employees</p>
                            <p className="font-medium">{business.employees}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Annual Revenue</p>
                            <p className="font-medium">KES {business.annualRevenue.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {!business.insured && (
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full md:w-auto">
                        Get Insurance Quote
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {businesses.length === 0 && !showAddBusiness && (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No businesses added yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your business to easily manage insurance and get quotes
                </p>
                <Button onClick={() => setShowAddBusiness(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Business
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
