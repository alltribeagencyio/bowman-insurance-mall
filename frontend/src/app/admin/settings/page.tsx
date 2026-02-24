'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Save, CreditCard, Shield, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getSettings, updateSettings, getRoles } from '@/lib/api/admin'
import { getErrorMessage } from '@/lib/api/errors'

interface GeneralSettings {
  site_name: string
  support_email: string
  support_phone: string
}

interface Role {
  id: string
  name: string
  description: string
}

export default function SettingsPage() {
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isSavingGeneral, setIsSavingGeneral] = useState(false)
  const [isSavingPayments, setIsSavingPayments] = useState(false)
  const [mpesaEnabled, setMpesaEnabled] = useState(true)
  const [cardEnabled, setCardEnabled] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])

  // General settings state
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    site_name: '',
    support_email: '',
    support_phone: '',
  })

  // Payment credential state (never pre-filled for security)
  const [mpesaKey, setMpesaKey] = useState('')
  const [mpesaSecret, setMpesaSecret] = useState('')
  const [mpesaShortcode, setMpesaShortcode] = useState('')
  const [paystackPublic, setPaystackPublic] = useState('')
  const [paystackSecret, setPaystackSecret] = useState('')

  // Template editing
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [templateContent, setTemplateContent] = useState('')

  useEffect(() => {
    loadSettings()
    loadRoles()
  }, [])

  const loadSettings = async () => {
    setIsLoadingSettings(true)
    try {
      const data = await getSettings()
      if (data) {
        setGeneralSettings({
          site_name: data.site_name || 'Bowman Insurance',
          support_email: data.support_email || 'support@bowmaninsurance.co.ke',
          support_phone: data.support_phone || '+254 700 000 000',
        })
        setMpesaEnabled(data.mpesa_enabled ?? true)
        setCardEnabled(data.card_enabled ?? true)
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to load settings'))
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const loadRoles = async () => {
    try {
      const data = await getRoles()
      setRoles(data || [])
    } catch {
      // Roles are non-critical — fail silently and use fallbacks
      setRoles([
        { id: 'admin', name: 'Admin', description: 'Full system access' },
        { id: 'staff', name: 'Staff', description: 'Limited admin access' },
        { id: 'customer', name: 'Customer', description: 'Standard user access' },
      ])
    }
  }

  const handleSaveGeneral = async () => {
    setIsSavingGeneral(true)
    try {
      await updateSettings(generalSettings)
      toast.success('Settings saved successfully')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to save settings'))
    } finally {
      setIsSavingGeneral(false)
    }
  }

  const handleSavePayments = async () => {
    setIsSavingPayments(true)
    try {
      const payload: Record<string, unknown> = {
        mpesa_enabled: mpesaEnabled,
        card_enabled: cardEnabled,
      }
      if (mpesaEnabled) {
        if (mpesaKey) payload.mpesa_consumer_key = mpesaKey
        if (mpesaSecret) payload.mpesa_consumer_secret = mpesaSecret
        if (mpesaShortcode) payload.mpesa_shortcode = mpesaShortcode
      }
      if (cardEnabled) {
        if (paystackPublic) payload.paystack_public_key = paystackPublic
        if (paystackSecret) payload.paystack_secret_key = paystackSecret
      }
      await updateSettings(payload)
      toast.success('Payment settings saved')
      // Clear credential fields after saving
      setMpesaKey('')
      setMpesaSecret('')
      setMpesaShortcode('')
      setPaystackPublic('')
      setPaystackSecret('')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to save payment settings'))
    } finally {
      setIsSavingPayments(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return
    try {
      await updateSettings({ templates: { [editingTemplate]: templateContent } })
      toast.success('Template saved')
      setEditingTemplate(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to save template'))
    }
  }

  const notificationTemplates = [
    { key: 'welcome', title: 'Welcome Email', description: 'Sent to new users on registration' },
    { key: 'payment_confirmation', title: 'Payment Confirmation', description: 'Sent after successful payment' },
    { key: 'claim_status', title: 'Claim Status Update', description: 'Sent when claim status changes' },
  ]

  const roleColors: Record<string, string> = {
    admin: 'text-red-500',
    staff: 'text-blue-500',
    customer: 'text-green-500',
  }

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage system configuration and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Payment Gateways</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input
                    value={generalSettings.site_name}
                    onChange={(e) => setGeneralSettings(s => ({ ...s, site_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={generalSettings.support_email}
                    onChange={(e) => setGeneralSettings(s => ({ ...s, support_email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Support Phone</Label>
                  <Input
                    value={generalSettings.support_phone}
                    onChange={(e) => setGeneralSettings(s => ({ ...s, support_phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input defaultValue="KES" disabled />
                </div>
              </div>
              <Button onClick={handleSaveGeneral} disabled={isSavingGeneral}>
                {isSavingGeneral ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isSavingGeneral ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Settings</CardTitle>
              <CardDescription>Configure payment methods. Credentials are write-only for security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    M-Pesa Integration
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Safaricom Daraja API</p>
                </div>
                <Switch checked={mpesaEnabled} onCheckedChange={setMpesaEnabled} />
              </div>

              {mpesaEnabled && (
                <div className="pl-4 space-y-4 border-l-2">
                  <div className="space-y-2">
                    <Label>Consumer Key</Label>
                    <Input placeholder="Enter new consumer key to update" type="password" value={mpesaKey} onChange={e => setMpesaKey(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Consumer Secret</Label>
                    <Input placeholder="Enter new consumer secret to update" type="password" value={mpesaSecret} onChange={e => setMpesaSecret(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Shortcode</Label>
                    <Input placeholder="Enter shortcode to update" value={mpesaShortcode} onChange={e => setMpesaShortcode(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Card Payments (Paystack)
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Paystack payment gateway</p>
                </div>
                <Switch checked={cardEnabled} onCheckedChange={setCardEnabled} />
              </div>

              {cardEnabled && (
                <div className="pl-4 space-y-4 border-l-2">
                  <div className="space-y-2">
                    <Label>Public Key</Label>
                    <Input placeholder="Enter new public key to update" value={paystackPublic} onChange={e => setPaystackPublic(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <Input placeholder="Enter new secret key to update" type="password" value={paystackSecret} onChange={e => setPaystackSecret(e.target.value)} />
                  </div>
                </div>
              )}

              <Button onClick={handleSavePayments} disabled={isSavingPayments}>
                {isSavingPayments ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isSavingPayments ? 'Saving...' : 'Save Payment Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Configure email and SMS templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationTemplates.map(template => (
                  <div key={template.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{template.title}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTemplate(template.key)
                        setTemplateContent('')
                      }}
                    >
                      Edit Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>User roles are managed at the system level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(roles.length > 0 ? roles : [
                  { id: 'admin', name: 'Admin', description: 'Full system access' },
                  { id: 'staff', name: 'Staff', description: 'Limited admin access' },
                  { id: 'customer', name: 'Customer', description: 'Standard user access' },
                ]).map(role => (
                  <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Shield className={`h-5 w-5 ${roleColors[role.id] || roleColors[role.name?.toLowerCase()] || 'text-gray-500'}`} />
                        {role.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Edit Permissions
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template edit dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              {notificationTemplates.find(t => t.key === editingTemplate)?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Template Content</Label>
            <Textarea
              placeholder="Enter template content (supports {user_name}, {amount}, {policy_number} variables)"
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              rows={8}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
