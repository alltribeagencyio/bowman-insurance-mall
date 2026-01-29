'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Phone, MessageSquare, FileQuestion, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Support ticket submitted:', formData)
    toast.success('Support ticket submitted successfully! Our team will respond within 24 hours.')
    setFormData({
      subject: '',
      category: '',
      priority: '',
      description: '',
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-muted-foreground">
          Get help with your insurance policies and account
        </p>
      </div>

      {/* Ticket Submission Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Submit a Support Ticket</CardTitle>
          <CardDescription>
            Fill out the form below and our support team will get back to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="policy">Policy Question</SelectItem>
                    <SelectItem value="claim">Claim Support</SelectItem>
                    <SelectItem value="payment">Payment Issue</SelectItem>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - General inquiry</SelectItem>
                  <SelectItem value="medium">Medium - Non-urgent issue</SelectItem>
                  <SelectItem value="high">High - Urgent matter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Provide detailed information about your issue or question..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Submit Ticket</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Other Help Options */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Other Ways to Get Help</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Contact Us */}
          <Card>
            <CardHeader>
              <Phone className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Call Us</CardTitle>
              <CardDescription>
                Speak directly with our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold mb-2">Customer Service</p>
              <p className="text-sm text-muted-foreground mb-1">+254 700 000 000</p>
              <p className="text-sm text-muted-foreground mb-4">Mon-Fri: 8AM - 6PM EAT</p>
              <Button variant="outline" className="w-full" size="sm">
                Call Now
              </Button>
            </CardContent>
          </Card>

          {/* Email Support */}
          <Card>
            <CardHeader>
              <Mail className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Email Us</CardTitle>
              <CardDescription>
                Send us a detailed message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold mb-2">Support Email</p>
              <p className="text-sm text-muted-foreground mb-4">support@bowman.co.ke</p>
              <p className="text-xs text-muted-foreground mb-4">
                We typically respond within 24 hours
              </p>
              <Button variant="outline" className="w-full" size="sm" asChild>
                <a href="mailto:support@bowman.co.ke">Send Email</a>
              </Button>
            </CardContent>
          </Card>

          {/* Live Chat */}
          <Card>
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Live Chat</CardTitle>
              <CardDescription>
                Chat with us in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold mb-2">Instant Support</p>
              <p className="text-sm text-muted-foreground mb-4">
                Available during business hours
              </p>
              <Button variant="outline" className="w-full" size="sm">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <HelpCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle>FAQ</CardTitle>
              <CardDescription>
                Find answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our comprehensive FAQ section
              </p>
              <Button variant="outline" className="w-full" size="sm">
                View FAQs
              </Button>
            </CardContent>
          </Card>

          {/* Documentation */}
          <Card>
            <CardHeader>
              <FileQuestion className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Access guides and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Learn how to use our platform
              </p>
              <Button variant="outline" className="w-full" size="sm">
                View Docs
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Claims */}
          <Card>
            <CardHeader>
              <Phone className="h-8 w-8 text-destructive mb-2" />
              <CardTitle>Emergency Claims</CardTitle>
              <CardDescription>
                24/7 emergency support line
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold mb-2">Emergency Hotline</p>
              <p className="text-sm text-muted-foreground mb-4">+254 711 000 000</p>
              <Button variant="destructive" className="w-full" size="sm">
                Call Emergency Line
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
