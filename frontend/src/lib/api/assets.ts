import { apiClient } from './client'

// Native Vehicle type matching the backend model
export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  registration_number: string
  chassis_number: string
  engine_number: string
  body_type: 'sedan' | 'suv' | 'pickup' | 'van' | 'bus' | 'truck' | 'motorcycle' | 'other'
  color: string
  value: number
  logbook_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateVehicleInput {
  make: string
  model: string
  year: number
  registration_number: string
  chassis_number?: string
  engine_number?: string
  body_type?: Vehicle['body_type']
  color?: string
  value: number
}

// ── Raw API calls ──────────────────────────────────────────────────────────

export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await apiClient.get('/assets/vehicles/')
  return response.data.results ?? response.data
}

export const createVehicle = async (data: CreateVehicleInput): Promise<Vehicle> => {
  const response = await apiClient.post('/assets/vehicles/', data)
  return response.data
}

export const updateVehicle = async (id: string, data: Partial<CreateVehicleInput>): Promise<Vehicle> => {
  const response = await apiClient.patch(`/assets/vehicles/${id}/`, data)
  return response.data
}

export const deleteVehicle = async (id: string): Promise<void> => {
  await apiClient.delete(`/assets/vehicles/${id}/`)
}

// ── Legacy Asset shape — used by the purchase flow ────────────────────────
// The purchase flow was built against this interface. We map Vehicle → Asset
// so the purchase page keeps working without changes.

export interface Asset {
  id: string
  asset_type: 'vehicle'
  name: string
  details: {
    make: string
    model: string
    year: number
    registration: string
    chassis_number: string
    engine_number: string
    value: number
  }
  created_at: string
  updated_at: string
}

const vehicleToAsset = (v: Vehicle): Asset => ({
  id: v.id,
  asset_type: 'vehicle',
  name: `${v.year} ${v.make} ${v.model}`,
  details: {
    make: v.make,
    model: v.model,
    year: v.year,
    registration: v.registration_number,
    chassis_number: v.chassis_number,
    engine_number: v.engine_number,
    value: v.value,
  },
  created_at: v.created_at,
  updated_at: v.updated_at,
})

/** Returns vehicles in the legacy Asset shape — used by the purchase flow */
export const getUserVehicles = async (): Promise<Asset[]> => {
  const vehicles = await getVehicles()
  return vehicles.map(vehicleToAsset)
}

/** Creates a vehicle from the legacy Asset input shape — used by the purchase flow */
export const createAsset = async (input: {
  asset_type: string
  name: string
  details: {
    make: string
    model: string
    year: number | string
    registration: string
    value: number | string
    chassis_number?: string
    engine_number?: string
  }
}): Promise<Asset> => {
  const vehicle = await createVehicle({
    make: input.details.make,
    model: input.details.model,
    year: typeof input.details.year === 'string' ? parseInt(input.details.year) : input.details.year,
    registration_number: input.details.registration,
    chassis_number: input.details.chassis_number ?? '',
    engine_number: input.details.engine_number ?? '',
    value: typeof input.details.value === 'string' ? parseFloat(input.details.value) : input.details.value,
  })
  return vehicleToAsset(vehicle)
}
