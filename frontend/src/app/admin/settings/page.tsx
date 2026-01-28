'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Save, Settings as SettingsIcon, CreditCard, Mail, Shield } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [mpesaEnabled, setMpesaEnabled] = useState(true)
  const [cardEnabled, setCardEnabled] = useState(true)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
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
                  <Input defaultValue="InsureMall Kenya" />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input defaultValue="support@insuremall.co.ke" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Support Phone</Label>
                  <Input defaultValue="+254 700 000 000" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input defaultValue="KES" disabled />
                </div>
              </div>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Settings</CardTitle>
              <CardDescription>Configure payment methods</CardDescription>
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
                    <Input placeholder="Enter consumer key" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Consumer Secret</Label>
                    <Input placeholder="Enter consumer secret" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Shortcode</Label>
                    <Input placeholder="Enter shortcode" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Card Payments
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Stripe / Flutterwave</p>
                </div>
                <Switch checked={cardEnabled} onCheckedChange={setCardEnabled} />
              </div>

              {cardEnabled && (
                <div className="pl-4 space-y-4 border-l-2">
                  <div className="space-y-2">
                    <Label>Public Key</Label>
                    <Input placeholder="Enter public key" />
                  </div>
                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <Input placeholder="Enter secret key" type="password" />
                  </div>
                </div>
              )}

              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Payment Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Configure email and SMS templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Welcome Email</h4>
                    <p className="text-sm text-muted-foreground">Sent to new users</p>
                  </div>
                  <Button variant="outline" size="sm">Edit Template</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Payment Confirmation</h4>
                    <p className="text-sm text-muted-foreground">Sent after successful payment</p>
                  </div>
                  <Button variant="outline" size="sm">Edit Template</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Claim Status Update</h4>
                    <p className="text-sm text-muted-foreground">Sent when claim status changes</p>
                  </div>
                  <Button variant="outline" size="sm">Edit Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Manage user roles and access control</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-500" />
                      Admin
                    </h4>
                    <p className="text-sm text-muted-foreground">Full system access</p>
                  </div>
                  <Button variant="outline" size="sm">Edit Permissions</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      Staff
                    </h4>
                    <p className="text-sm text-muted-foreground">Limited admin access</p>
                  </div>
                  <Button variant="outline" size="sm">Edit Permissions</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      Customer
                    </h4>
                    <p className="text-sm text-muted-foreground">Standard user access</p>
                  </div>
                  <Button variant="outline" size="sm">Edit Permissions</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
