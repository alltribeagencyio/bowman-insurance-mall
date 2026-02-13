'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getAllUsers, type User } from '@/lib/api/admin'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Mail,
  Shield,
  Eye
} from 'lucide-react'

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '+254712345678',
    role: 'customer',
    status: 'active',
    created_at: '2025-12-15T00:00:00Z',
    policies_count: 3,
    total_spent: 125000
  },
  {
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    phone: '+254723456789',
    role: 'customer',
    status: 'active',
    created_at: '2026-01-10T00:00:00Z',
    policies_count: 2,
    total_spent: 85000
  },
  {
    id: '3',
    first_name: 'Mike',
    last_name: 'Johnson',
    email: 'mike@example.com',
    phone: '+254734567890',
    role: 'customer',
    status: 'pending',
    created_at: '2026-01-27T08:00:00Z',
    policies_count: 0,
    total_spent: 0
  },
  {
    id: '4',
    first_name: 'Sarah',
    last_name: 'Williams',
    email: 'sarah@insuremall.com',
    phone: '+254745678901',
    role: 'staff',
    status: 'active',
    created_at: '2025-11-01T00:00:00Z',
    policies_count: 0,
    total_spent: 0
  },
  {
    id: '5',
    first_name: 'Robert',
    last_name: 'Brown',
    email: 'robert@example.com',
    phone: '+254756789012',
    role: 'customer',
    status: 'suspended',
    created_at: '2025-10-20T00:00:00Z',
    policies_count: 1,
    total_spent: 45000
  }
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Load users from API on mount
  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchQuery, roleFilter, statusFilter, users])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const response = await getAllUsers({
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      })
      setUsers(response.results)
    } catch (error: any) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
      // Fallback to mock data on error
      setUsers(mockUsers)
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleSuspendUser = async (userId: string) => {
    try {
      // TODO: API call
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'suspended' } : u))
      toast.success('User suspended successfully')
    } catch (error) {
      toast.error('Failed to suspend user')
    }
  }

  const handleActivateUser = async (userId: string) => {
    try {
      // TODO: API call
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u))
      toast.success('User activated successfully')
    } catch (error) {
      toast.error('Failed to activate user')
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      // TODO: API call
      setUsers(users.filter(u => u.id !== selectedUser.id))
      toast.success('User deleted successfully')
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      admin: 'default',
      staff: 'secondary',
      customer: 'outline'
    }
    return variants[role] || 'outline'
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="gap-1"><CheckCircle className="h-3 w-3" />Active</Badge>
    }
    if (status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>
    }
    if (status === 'suspended') {
      return <Badge variant="destructive">Suspended</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users, roles, and permissions
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Users ({filteredUsers.length})
          </CardTitle>
          <CardDescription>
            A list of all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Contact</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Policies</th>
                  <th className="text-left p-4 font-medium">Total Spent</th>
                  <th className="text-left p-4 font-medium">Joined</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{user.phone}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{user.policies_count}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium">{formatCurrency(user.total_spent)}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{formatDate(user.created_at)}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspendUser(user.id)}
                          >
                            <Ban className="h-4 w-4 text-red-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivateUser(user.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsDeleteModalOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.first_name} {selectedUser?.last_name}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
