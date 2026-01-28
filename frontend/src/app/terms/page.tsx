import { Card, CardContent } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms and Conditions
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 2024
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-8 pb-6 prose prose-slate dark:prose-invert max-w-none">
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By accessing and using Bowman Insurance Mall, you accept and agree to be bound by the terms
                  and provision of this agreement. If you do not agree to these terms, please do not use our service.
                </p>

                <h2>2. Use of Service</h2>
                <p>
                  Bowman Insurance Mall provides an online marketplace for comparing and purchasing insurance
                  policies from licensed insurance providers in Kenya. You agree to use this service only for
                  lawful purposes and in accordance with these terms.
                </p>

                <h2>3. User Account</h2>
                <p>
                  To access certain features of our service, you must register for an account. You are responsible
                  for maintaining the confidentiality of your account credentials and for all activities that occur
                  under your account.
                </p>

                <h2>4. Insurance Policies</h2>
                <p>
                  All insurance policies available through our platform are underwritten by licensed insurance
                  companies regulated by the Insurance Regulatory Authority (IRA) of Kenya. Policy terms and
                  conditions are set by the respective insurance providers.
                </p>

                <h2>5. Payment Terms</h2>
                <p>
                  Premium payments must be made through our secure payment gateway. We accept M-Pesa, Visa,
                  and Mastercard. All transactions are processed securely and are subject to verification.
                </p>

                <h2>6. Cancellations and Refunds</h2>
                <p>
                  Cancellation and refund policies vary by insurance provider and policy type. Please review
                  the specific terms of your policy for detailed information about cancellations and refunds.
                </p>

                <h2>7. Claims</h2>
                <p>
                  Claims must be filed through our platform or directly with the insurance provider. We facilitate
                  the claims process but final decisions are made by the underwriting insurance company.
                </p>

                <h2>8. Limitation of Liability</h2>
                <p>
                  Bowman Insurance Mall acts as an intermediary between customers and insurance providers. We
                  are not liable for any disputes arising from insurance coverage, claims, or policy terms set
                  by the insurance providers.
                </p>

                <h2>9. Intellectual Property</h2>
                <p>
                  All content, trademarks, and data on this platform are the property of Bowman Insurance Mall
                  or its content suppliers. Unauthorized use of any materials is prohibited.
                </p>

                <h2>10. Privacy</h2>
                <p>
                  Your use of our service is also governed by our Privacy Policy. Please review our Privacy
                  Policy to understand our practices.
                </p>

                <h2>11. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any material
                  changes via email or through the platform.
                </p>

                <h2>12. Governing Law</h2>
                <p>
                  These terms shall be governed by and construed in accordance with the laws of Kenya. Any
                  disputes arising from these terms shall be subject to the exclusive jurisdiction of the
                  courts of Kenya.
                </p>

                <h2>13. Contact Information</h2>
                <p>
                  For questions about these Terms and Conditions, please contact us at:
                  <br />
                  Email: legal@bowmaninsurance.com
                  <br />
                  Phone: +254 700 000 000
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
