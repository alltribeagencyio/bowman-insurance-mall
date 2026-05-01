'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  type Vehicle,
  type CreateVehicleInput,
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '@/lib/api/assets'

const BODY_TYPES: { value: Vehicle['body_type']; label: string }[] = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'pickup', label: 'Pick-up / Double Cab' },
  { value: 'van', label: 'Van / Minivan' },
  { value: 'bus', label: 'Bus / Minibus' },
  { value: 'truck', label: 'Truck' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'other', label: 'Other' },
]

const emptyForm: CreateVehicleInput = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  registration_number: '',
  chassis_number: '',
  engine_number: '',
  body_type: 'sedan',
  color: '',
  value: 0,
}

export default function AssetsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateVehicleInput>(emptyForm)

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      setIsLoading(true)
      const data = await getVehicles()
      setVehicles(data)
    } catch {
      toast.error('Failed to load vehicles')
    } finally {
      setIsLoading(false)
    }
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (v: Vehicle) => {
    setEditingId(v.id)
    setForm({
      make: v.make,
      model: v.model,
      year: v.year,
      registration_number: v.registration_number,
      chassis_number: v.chassis_number,
      engine_number: v.engine_number,
      body_type: v.body_type,
      color: v.color,
      value: v.value,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.make || !form.model || !form.registration_number || !form.value) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    try {
      if (editingId) {
        const updated = await updateVehicle(editingId, form)
        setVehicles(vs => vs.map(v => v.id === editingId ? updated : v))
        toast.success('Vehicle updated')
      } else {
        const created = await createVehicle(form)
        setVehicles(vs => [created, ...vs])
        toast.success('Vehicle added')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
    } catch {
      toast.error(editingId ? 'Failed to update vehicle' : 'Failed to add vehicle')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this vehicle?')) return
    setDeletingId(id)
    try {
      await deleteVehicle(id)
      setVehicles(vs => vs.filter(v => v.id !== id))
      toast.success('Vehicle removed')
    } catch {
      toast.error('Failed to remove vehicle')
    } finally {
      setDeletingId(null)
    }
  }

  const set = (field: keyof CreateVehicleInput, value: string | number) =>
    setForm(f => ({ ...f, [field]: value }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Vehicles</h1>
          <p className="text-muted-foreground mt-1">
            Manage your vehicles for motor insurance
          </p>
        </div>
        {!showForm && (
          <Button onClick={openAddForm}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</CardTitle>
            <CardDescription>Enter your vehicle details</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    placeholder="e.g. Toyota"
                    value={form.make}
                    onChange={e => set('make', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    placeholder="e.g. Land Cruiser"
                    value={form.model}
                    onChange={e => set('model', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year of Manufacture *</Label>
                  <Input
                    id="year"
                    type="number"
                    min={1950}
                    max={new Date().getFullYear() + 1}
                    value={form.year}
                    onChange={e => set('year', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration Number *</Label>
                  <Input
                    id="registration_number"
                    placeholder="KCE 123A"
                    value={form.registration_number}
                    onChange={e => set('registration_number', e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body_type">Body Type</Label>
                  <Select
                    value={form.body_type}
                    onValueChange={v => set('body_type', v)}
                  >
                    <SelectTrigger id="body_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BODY_TYPES.map(bt => (
                        <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chassis_number">Chassis Number</Label>
                  <Input
                    id="chassis_number"
                    placeholder="JTMHV05J504123456"
                    value={form.chassis_number}
                    onChange={e => set('chassis_number', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engine_number">Engine Number</Label>
                  <Input
                    id="engine_number"
                    placeholder="1GR-FE-1234567"
                    value={form.engine_number}
                    onChange={e => set('engine_number', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="e.g. White"
                    value={form.color}
                    onChange={e => set('color', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Current Market Value (KES) *</Label>
                  <Input
                    id="value"
                    type="number"
                    min={1}
                    placeholder="8500000"
                    value={form.value || ''}
                    onChange={e => set('value', parseFloat(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditingId(null) }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Add Vehicle'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Vehicles List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : vehicles.length === 0 && !showForm ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No vehicles added yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your vehicles to manage motor insurance easily
            </p>
            <Button onClick={openAddForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Vehicle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {vehicles.map(vehicle => (
            <Card key={vehicle.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <h3 className="font-semibold text-lg">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <Badge variant="outline" className="capitalize">
                          {vehicle.body_type.replace('_', ' ')}
                        </Badge>
                        {vehicle.logbook_url ? (
                          <Badge variant="secondary" className="gap-1 text-green-700 bg-green-50">
                            <CheckCircle2 className="h-3 w-3" />
                            Logbook uploaded
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-amber-700 bg-amber-50">
                            <AlertCircle className="h-3 w-3" />
                            No logbook
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Registration</p>
                          <p className="font-medium font-mono">{vehicle.registration_number}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Value</p>
                          <p className="font-medium">
                            KES {Number(vehicle.value).toLocaleString()}
                          </p>
                        </div>
                        {vehicle.chassis_number && (
                          <div>
                            <p className="text-muted-foreground">Chassis</p>
                            <p className="font-medium font-mono text-xs">{vehicle.chassis_number}</p>
                          </div>
                        )}
                        {vehicle.engine_number && (
                          <div>
                            <p className="text-muted-foreground">Engine</p>
                            <p className="font-medium font-mono text-xs">{vehicle.engine_number}</p>
                          </div>
                        )}
                        {vehicle.color && (
                          <div>
                            <p className="text-muted-foreground">Color</p>
                            <p className="font-medium">{vehicle.color}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditForm(vehicle)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(vehicle.id)}
                      disabled={deletingId === vehicle.id}
                    >
                      {deletingId === vehicle.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
