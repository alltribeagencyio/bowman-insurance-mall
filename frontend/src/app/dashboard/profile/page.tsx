'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { getProfile } from '@/lib/api/auth'
import { updateUserProfile, changePassword, getNotificationPreferences, updateNotificationPreferences, enable2FA, disable2FA, requestAccountDeletion } from '@/lib/api/profile'
import { getBeneficiaries, deleteBeneficiary, setPrimaryBeneficiary } from '@/lib/api/beneficiaries'
import { BeneficiaryModal } from '@/components/dashboard/beneficiary-modal'
import { getErrorMessage } from '@/lib/api/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Save,
  Lock,
  Users,
  Bell,
  Shield,
  Trash2,
  AlertTriangle,
  Plus,
  Edit,
  Mail,
  Smartphone,
  CheckCircle2,
  Award,
  Star,
  Gift,
  TrendingUp,
  Crown,
  Trophy,
  Target,
  Sparkles,
  Zap,
  ArrowRight,
  Upload,
  FileText
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface Beneficiary {
  id: string
  name: string
  relationship: string
  percentage: number
  phone: string
  email: string
  is_primary: boolean
}

// Mock beneficiaries data
const mockBeneficiaries: Beneficiary[] = [
  {
    id: '1',
    name: 'Jane Doe',
    relationship: 'Spouse',
    percentage: 60,
    phone: '+254712345678',
    email: 'jane@example.com',
    is_primary: true
  },
  {
    id: '2',
    name: 'John Doe Jr.',
    relationship: 'Child',
    percentage: 40,
    phone: '+254712345679',
    email: 'john.jr@example.com',
    is_primary: false
  }
]

// Mock loyalty data
const mockLoyaltyData = {
  points: 2450,
  pointsValue: 2450,
  tier: 'Gold',
  nextTier: 'Platinum',
  pointsToNextTier: 550,
  lifetimePoints: 5200,
  pointsHistory: [
    { id: '1', action: 'Policy Purchase - Motor Insurance', points: 500, date: '2026-01-28', type: 'earned' },
    { id: '2', action: 'Referral Bonus - Friend Signup', points: 250, date: '2026-01-25', type: 'earned' },
    { id: '3', action: 'Redeemed for Medical Insurance Discount', points: -1000, date: '2026-01-20', type: 'redeemed' },
    { id: '4', action: 'On-Time Premium Payment', points: 100, date: '2026-01-15', type: 'earned' },
  ],
  rewards: [
    { id: '1', title: '10% Discount on Next Premium', pointsCost: 1000, description: 'Get 10% off on your next policy premium payment', category: 'discount', available: true },
    { id: '2', title: 'Free Motor Insurance Add-on', pointsCost: 2000, description: 'Add windscreen cover or personal accident cover for free', category: 'upgrade', available: true },
    { id: '3', title: '20% Discount on Next Premium', pointsCost: 1800, description: 'Get 20% off on your next policy premium payment', category: 'discount', available: true },
  ]
}

const tiers = [
  { name: 'Bronze', minPoints: 0, color: 'text-orange-700', bgColor: 'bg-orange-100 dark:bg-orange-950' },
  { name: 'Silver', minPoints: 1000, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  { name: 'Gold', minPoints: 2000, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-950' },
  { name: 'Platinum', minPoints: 3000, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-950' },
]

function ProfileContent() {
  const { user, updateProfile } = useAuth()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('personal')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Handle tab query parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['personal', 'loyalty', 'security', 'beneficiaries', 'notifications', 'advanced'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Personal Information State
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  })

  // Load user profile and preferences on mount
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setIsLoadingData(true)
      // Load profile
      const profile = await getProfile()
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
      })

      // Load notification preferences
      const prefs = await getNotificationPreferences()
      setNotifications(prefs)

      // Load beneficiaries
      const beneficiariesData = await getBeneficiaries()
      setBeneficiaries(beneficiariesData)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to load profile data'))
    } finally {
      setIsLoadingData(false)
    }
  }

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Beneficiaries State
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])

  // Loyalty State
  const [loyaltyData] = useState(mockLoyaltyData)

  // Notification Preferences State — field names match backend NotificationPreference model
  const [notifications, setNotifications] = useState({
    email_policy_updates: true,
    email_payment_reminders: true,
    email_claim_updates: true,
    email_marketing: false,
    sms_policy_updates: true,
    sms_payment_reminders: true,
    sms_claim_updates: true,
    whatsapp_enabled: false,
    in_app_enabled: true,
  })

  // Security Settings State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Beneficiary modal state
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false)
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUserProfile(formData)
      await updateProfile(formData) // Update auth context
      toast.success('Profile updated successfully!')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update profile'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    try {
      await changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      })
      toast.success('Password changed successfully!')
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to change password'))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRemoveBeneficiary = async (id: string) => {
    if (confirm('Are you sure you want to remove this beneficiary?')) {
      try {
        await deleteBeneficiary(id)
        setBeneficiaries(beneficiaries.filter(b => b.id !== id))
        toast.success('Beneficiary removed')
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Failed to remove beneficiary'))
      }
    }
  }

  const handleNotificationToggle = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications]
    })
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    try {
      await updateNotificationPreferences(notifications)
      toast.success('Notification preferences saved!')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to save preferences'))
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FAToggle = async () => {
    try {
      if (twoFactorEnabled) {
        await disable2FA()
        setTwoFactorEnabled(false)
        toast.success('2FA disabled')
      } else {
        await enable2FA()
        setTwoFactorEnabled(true)
        toast.success('2FA enabled. Check your authenticator app.')
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update 2FA settings'))
    }
  }

  const handleSetPrimaryBeneficiary = async (id: string) => {
    try {
      await setPrimaryBeneficiary(id)
      setBeneficiaries(beneficiaries.map(b => ({ ...b, is_primary: b.id === id })))
      toast.success('Primary beneficiary updated')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update primary beneficiary'))
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return
    try {
      await requestAccountDeletion('User requested account deletion')
      toast.success('Account deletion request submitted. You will be contacted.')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to submit account deletion request'))
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Loyalty</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="beneficiaries" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Beneficiaries</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your email address and verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={user?.is_verified ? 'default' : 'secondary'} className="gap-1">
                    {user?.is_verified && <CheckCircle2 className="h-3 w-3" />}
                    {user?.is_verified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for M-Pesa payments and SMS notifications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kra_pin">KRA PIN (Optional)</Label>
                  <Input
                    id="kra_pin"
                    name="kra_pin"
                    type="text"
                    placeholder="A123456789K"
                    maxLength={11}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Kenya Revenue Authority Personal Identification Number
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Identity Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Identity Documents
              </CardTitle>
              <CardDescription>
                Upload your National ID or Passport for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idType">Document Type</Label>
                  <select
                    id="idType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID/Passport Number</Label>
                  <Input
                    id="idNumber"
                    type="text"
                    placeholder="12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idDocument">Upload Document</Label>
                  <div className="flex items-center gap-2">
                    <Input id="idDocument" type="file" accept=".pdf,.jpg,.jpeg,.png" className="flex-1" />
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload clear copy of your National ID or Passport (PDF, JPG, or PNG, max 5MB)
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                        Document Security
                      </h4>
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        Your documents are encrypted and stored securely. We only use them for identity verification and never share with third parties.
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Identity Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyalty Program Tab */}
        <TabsContent value="loyalty" className="space-y-6">
          {/* Points Balance Card */}
          <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm opacity-90 mb-2">Your Points Balance</p>
                  <h2 className="text-5xl font-bold">{loyaltyData.points.toLocaleString()}</h2>
                  <p className="text-sm opacity-90 mt-2">
                    ≈ KES {loyaltyData.pointsValue.toLocaleString()} in value
                  </p>
                </div>
                <Trophy className="h-20 w-20 opacity-50" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    <span className="font-semibold">Current Tier: {loyaltyData.tier}</span>
                  </div>
                  <span className="text-sm opacity-90">
                    {loyaltyData.pointsToNextTier} points to {loyaltyData.nextTier}
                  </span>
                </div>
                <Progress value={70} className="h-2 bg-purple-900" />
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lifetime Points</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loyaltyData.lifetimePoints.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Rewards</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loyaltyData.rewards.filter(r => r.pointsCost <= loyaltyData.points).length}
                </div>
                <p className="text-xs text-muted-foreground">Can redeem now</p>
              </CardContent>
            </Card>
          </div>

          {/* Membership Tiers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Membership Tiers
              </CardTitle>
              <CardDescription>Progress through tiers to unlock better rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`p-4 rounded-lg border-2 ${
                      tier.name === loyaltyData.tier
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <div className={`${tier.bgColor} ${tier.color} p-2 rounded-full w-fit mb-2`}>
                      <Crown className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold">{tier.name}</h4>
                    <p className="text-xs text-muted-foreground">{tier.minPoints}+ points</p>
                    {tier.name === loyaltyData.tier && (
                      <Badge variant="default" className="mt-2">Current</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Rewards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Available Rewards
              </CardTitle>
              <CardDescription>Redeem your points for exclusive benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loyaltyData.rewards.map((reward) => {
                  const canRedeem = reward.pointsCost <= loyaltyData.points && reward.available
                  return (
                    <div
                      key={reward.id}
                      className={`p-4 border rounded-lg ${
                        !canRedeem ? 'opacity-60' : 'hover:bg-muted/50'
                      } transition-colors`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold flex items-center gap-2">
                            {reward.title}
                            {reward.category === 'free' && <Sparkles className="h-4 w-4 text-amber-500" />}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reward.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="font-bold">{reward.pointsCost.toLocaleString()} points</span>
                        </div>
                        <Button size="sm" disabled={!canRedeem}>
                          Redeem
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Points History */}
          <Card>
            <CardHeader>
              <CardTitle>Points History</CardTitle>
              <CardDescription>Recent earning and redemption activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loyaltyData.pointsHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {entry.type === 'earned' ? (
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-950">
                          <Star className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-950">
                          <Gift className="h-4 w-4 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-bold ${
                        entry.type === 'earned' ? 'text-green-600' : 'text-purple-600'
                      }`}
                    >
                      {entry.type === 'earned' ? '+' : ''}{entry.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old_password">Current Password</Label>
                  <Input
                    id="old_password"
                    name="old_password"
                    type="password"
                    value={passwordData.old_password}
                    onChange={handlePasswordInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={handlePasswordInputChange}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Require a verification code in addition to your password
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handle2FAToggle}
                />
              </div>

              {twoFactorEnabled && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Two-factor authentication is enabled. You'll receive a code via SMS when logging in.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Beneficiaries Tab */}
        <TabsContent value="beneficiaries" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Beneficiaries
                  </CardTitle>
                  <CardDescription>
                    Manage who receives benefits from your policies
                  </CardDescription>
                </div>
                <Button onClick={() => { setEditingBeneficiary(null); setShowBeneficiaryModal(true) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Beneficiary
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {beneficiaries.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No beneficiaries added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add beneficiaries to your policies
                  </p>
                  <Button onClick={() => { setEditingBeneficiary(null); setShowBeneficiaryModal(true) }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Beneficiary
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {beneficiaries.map((beneficiary) => (
                    <Card key={beneficiary.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{beneficiary.name}</h3>
                              {beneficiary.is_primary && (
                                <Badge>Primary</Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <p>Relationship: {beneficiary.relationship}</p>
                              <p>Allocation: {beneficiary.percentage}%</p>
                              <p className="flex items-center gap-1">
                                <Smartphone className="h-3 w-3" />
                                {beneficiary.phone}
                              </p>
                              <p className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {beneficiary.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!beneficiary.is_primary && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetPrimaryBeneficiary(beneficiary.id)}
                              >
                                Set Primary
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setEditingBeneficiary(beneficiary); setShowBeneficiaryModal(true) }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveBeneficiary(beneficiary.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Allocation Summary */}
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Total Allocation</span>
                      <span className="text-lg font-bold">
                        {beneficiaries.reduce((sum, b) => sum + b.percentage, 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{
                          width: `${beneficiaries.reduce((sum, b) => sum + b.percentage, 0)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Choose which updates you receive via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Policy Updates</p>
                  <p className="text-sm text-muted-foreground">Changes to your policy terms and coverage</p>
                </div>
                <Switch
                  checked={notifications.email_policy_updates}
                  onCheckedChange={() => handleNotificationToggle('email_policy_updates')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Payment Reminders</p>
                  <p className="text-sm text-muted-foreground">Upcoming and overdue payment alerts</p>
                </div>
                <Switch
                  checked={notifications.email_payment_reminders}
                  onCheckedChange={() => handleNotificationToggle('email_payment_reminders')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Claim Updates</p>
                  <p className="text-sm text-muted-foreground">Status updates on your insurance claims</p>
                </div>
                <Switch
                  checked={notifications.email_claim_updates}
                  onCheckedChange={() => handleNotificationToggle('email_claim_updates')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Marketing Communications</p>
                  <p className="text-sm text-muted-foreground">Special offers and product updates</p>
                </div>
                <Switch
                  checked={notifications.email_marketing}
                  onCheckedChange={() => handleNotificationToggle('email_marketing')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SMS Notifications
              </CardTitle>
              <CardDescription>
                Choose which updates you receive via text message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Policy Updates</p>
                  <p className="text-sm text-muted-foreground">SMS alerts for policy changes</p>
                </div>
                <Switch
                  checked={notifications.sms_policy_updates}
                  onCheckedChange={() => handleNotificationToggle('sms_policy_updates')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Payment Reminders</p>
                  <p className="text-sm text-muted-foreground">SMS reminders for upcoming payments</p>
                </div>
                <Switch
                  checked={notifications.sms_payment_reminders}
                  onCheckedChange={() => handleNotificationToggle('sms_payment_reminders')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Claim Updates</p>
                  <p className="text-sm text-muted-foreground">SMS updates on claim status changes</p>
                </div>
                <Switch
                  checked={notifications.sms_claim_updates}
                  onCheckedChange={() => handleNotificationToggle('sms_claim_updates')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Other Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">WhatsApp Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via WhatsApp</p>
                </div>
                <Switch
                  checked={notifications.whatsapp_enabled}
                  onCheckedChange={() => handleNotificationToggle('whatsapp_enabled')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">In-App Notifications</p>
                  <p className="text-sm text-muted-foreground">Show notifications within the app</p>
                </div>
                <Switch
                  checked={notifications.in_app_enabled}
                  onCheckedChange={() => handleNotificationToggle('in_app_enabled')}
                />
              </div>

              <Button onClick={handleSaveNotifications} disabled={isLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-red-900 dark:text-red-100">
                  Delete Account
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                  Once you delete your account, there is no going back. All your policies,
                  payment history, and personal data will be permanently deleted.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete My Account
                </Button>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  If you're having issues with your account, please contact our support team
                  before deleting your account.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/support">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Beneficiary Modal */}
      <BeneficiaryModal
        isOpen={showBeneficiaryModal}
        onClose={() => { setShowBeneficiaryModal(false); setEditingBeneficiary(null) }}
        beneficiary={editingBeneficiary}
        existingPercentage={beneficiaries
          .filter(b => b.id !== editingBeneficiary?.id)
          .reduce((sum, b) => sum + b.percentage, 0)}
        onSuccess={() => {
          setShowBeneficiaryModal(false)
          setEditingBeneficiary(null)
          loadUserData()
        }}
      />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
