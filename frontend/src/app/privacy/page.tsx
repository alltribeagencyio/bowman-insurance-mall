import { Card, CardContent } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 2024
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-8 pb-6 prose prose-slate dark:prose-invert max-w-none">
                <h2>1. Introduction</h2>
                <p>
                  Bowman Insurance Mall ("we," "our," or "us") is committed to protecting your privacy. This
                  Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                  you use our insurance marketplace platform.
                </p>

                <h2>2. Information We Collect</h2>
                <h3>2.1 Personal Information</h3>
                <p>
                  We collect personal information that you provide to us, including:
                </p>
                <ul>
                  <li>Name, email address, phone number</li>
                  <li>Identification documents (ID, passport)</li>
                  <li>Date of birth and address</li>
                  <li>Payment information</li>
                  <li>Insurance policy details</li>
                </ul>

                <h3>2.2 Automatically Collected Information</h3>
                <p>
                  When you use our platform, we automatically collect:
                </p>
                <ul>
                  <li>IP address and device information</li>
                  <li>Browser type and operating system</li>
                  <li>Pages visited and time spent on our platform</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>

                <h2>3. How We Use Your Information</h2>
                <p>
                  We use your information to:
                </p>
                <ul>
                  <li>Process insurance policy applications and payments</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Send policy documents and important notifications</li>
                  <li>Improve our platform and services</li>
                  <li>Comply with legal obligations and prevent fraud</li>
                  <li>Send marketing communications (with your consent)</li>
                </ul>

                <h2>4. Information Sharing</h2>
                <p>
                  We share your information with:
                </p>
                <ul>
                  <li><strong>Insurance Providers:</strong> To process your policy applications and claims</li>
                  <li><strong>Payment Processors:</strong> To facilitate secure transactions</li>
                  <li><strong>Service Providers:</strong> Who assist in operating our platform</li>
                  <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                </ul>
                <p>
                  We do not sell your personal information to third parties.
                </p>

                <h2>5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your information,
                  including:
                </p>
                <ul>
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Secure data storage with access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>Staff training on data protection</li>
                </ul>

                <h2>6. Your Rights</h2>
                <p>
                  You have the right to:
                </p>
                <ul>
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Request deletion of your data (subject to legal requirements)</li>
                  <li>Object to processing of your data</li>
                  <li>Withdraw consent for marketing communications</li>
                  <li>Request a copy of your data in a portable format</li>
                </ul>

                <h2>7. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar technologies to:
                </p>
                <ul>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze platform usage and improve functionality</li>
                  <li>Provide personalized content and recommendations</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. See our Cookie Policy for more details.
                </p>

                <h2>8. Data Retention</h2>
                <p>
                  We retain your information for as long as necessary to:
                </p>
                <ul>
                  <li>Provide our services and maintain your account</li>
                  <li>Comply with legal, regulatory, and insurance requirements</li>
                  <li>Resolve disputes and enforce our agreements</li>
                </ul>

                <h2>9. Children's Privacy</h2>
                <p>
                  Our services are not intended for individuals under 18 years of age. We do not knowingly
                  collect personal information from children.
                </p>

                <h2>10. International Data Transfers</h2>
                <p>
                  Your information is primarily stored and processed in Kenya. If we transfer data outside
                  Kenya, we ensure appropriate safeguards are in place.
                </p>

                <h2>11. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material
                  changes by email or through our platform.
                </p>

                <h2>12. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or wish to exercise your rights, contact us at:
                  <br />
                  Email: privacy@bowmaninsurance.com
                  <br />
                  Phone: +254 700 000 000
                  <br />
                  Address: Westlands, Nairobi, Kenya
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
