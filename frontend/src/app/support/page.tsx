import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Phone, Mail, FileText, HelpCircle, Book } from 'lucide-react'

export default function SupportPage() {
  const faqs = [
    {
      question: 'How do I purchase an insurance policy?',
      answer: 'Browse our policies, select the one that suits you, fill in your details, and make payment via M-Pesa or card. Your policy will be activated immediately.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept M-Pesa, Visa, and Mastercard. All payments are processed securely.',
    },
    {
      question: 'How do I file a claim?',
      answer: 'Go to your dashboard, select "Claims", fill in the claim form with required documents, and submit. Our team will process it within 24-48 hours.',
    },
    {
      question: 'Can I cancel my policy?',
      answer: 'Yes, you can cancel your policy from your dashboard. Refunds are processed according to the terms of your specific policy.',
    },
    {
      question: 'How do I update my beneficiaries?',
      answer: 'Go to Profile > Beneficiaries in your dashboard. You can add, edit, or remove beneficiaries at any time.',
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we use bank-grade encryption and are fully compliant with data protection regulations.',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How Can We Help You?
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers to common questions or get in touch with our support team
            </p>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Get Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-6">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with our support team in real-time
                </p>
                <Button>Start Chat</Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-6">
                <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Call Us</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Speak directly with our experts
                </p>
                <Button variant="outline">+254 700 000 000</Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-6">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Email</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Send us a detailed message
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contact">Contact Form</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Resources */}
          <h2 className="text-3xl font-bold mb-8 text-center">Helpful Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link href="/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>My Policies</CardTitle>
                  <CardDescription>
                    View and manage your active insurance policies
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/claims/new">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <HelpCircle className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>File a Claim</CardTitle>
                  <CardDescription>
                    Submit a new insurance claim quickly and easily
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/policies">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Book className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Browse Policies</CardTitle>
                  <CardDescription>
                    Explore our comprehensive insurance offerings
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
