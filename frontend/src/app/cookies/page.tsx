import { Card, CardContent } from '@/components/ui/card'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Cookie Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 2024
            </p>
          </div>
        </div>
      </section>

      {/* Cookie Policy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-8 pb-6 prose prose-slate dark:prose-invert max-w-none">
                <h2>1. What Are Cookies?</h2>
                <p>
                  Cookies are small text files that are placed on your device when you visit our website.
                  They help us provide you with a better experience by remembering your preferences and
                  understanding how you use our platform.
                </p>

                <h2>2. Types of Cookies We Use</h2>

                <h3>2.1 Essential Cookies</h3>
                <p>
                  These cookies are necessary for the platform to function properly. They enable core
                  functionality such as:
                </p>
                <ul>
                  <li>User authentication and security</li>
                  <li>Session management</li>
                  <li>Load balancing</li>
                  <li>Shopping cart functionality</li>
                </ul>

                <h3>2.2 Performance Cookies</h3>
                <p>
                  These cookies collect information about how you use our platform, such as:
                </p>
                <ul>
                  <li>Which pages you visit most often</li>
                  <li>Error messages you receive</li>
                  <li>Time spent on pages</li>
                  <li>Navigation patterns</li>
                </ul>

                <h3>2.3 Functionality Cookies</h3>
                <p>
                  These cookies remember your choices and preferences, including:
                </p>
                <ul>
                  <li>Language preferences</li>
                  <li>Region or location</li>
                  <li>Theme preferences (dark/light mode)</li>
                  <li>Text size and display settings</li>
                </ul>

                <h3>2.4 Targeting/Advertising Cookies</h3>
                <p>
                  These cookies track your browsing habits to provide relevant advertisements and content:
                </p>
                <ul>
                  <li>Track visits to other websites</li>
                  <li>Deliver targeted advertising</li>
                  <li>Measure advertising effectiveness</li>
                  <li>Limit ad frequency</li>
                </ul>

                <h2>3. Third-Party Cookies</h2>
                <p>
                  We use services from trusted third parties that may place cookies on your device:
                </p>
                <ul>
                  <li><strong>Google Analytics:</strong> To analyze website traffic and usage</li>
                  <li><strong>Payment Processors:</strong> For secure payment processing</li>
                  <li><strong>Social Media Platforms:</strong> For social sharing features</li>
                </ul>

                <h2>4. How Long Do Cookies Last?</h2>
                <p>
                  <strong>Session Cookies:</strong> Temporary cookies deleted when you close your browser
                  <br />
                  <strong>Persistent Cookies:</strong> Remain on your device for a set period or until you delete them
                </p>

                <h2>5. Managing Cookies</h2>
                <p>
                  You can control and manage cookies in several ways:
                </p>

                <h3>5.1 Browser Settings</h3>
                <p>
                  Most browsers allow you to:
                </p>
                <ul>
                  <li>View what cookies are stored on your device</li>
                  <li>Delete existing cookies</li>
                  <li>Block all or some cookies</li>
                  <li>Accept or reject cookies from specific websites</li>
                </ul>

                <h3>5.2 Opt-Out Tools</h3>
                <p>
                  You can opt out of certain cookies using:
                </p>
                <ul>
                  <li>Google Analytics Opt-out Browser Add-on</li>
                  <li>Network Advertising Initiative opt-out tool</li>
                  <li>Your Online Choices (for EU users)</li>
                </ul>

                <h2>6. Impact of Disabling Cookies</h2>
                <p>
                  If you disable cookies, some features of our platform may not work properly:
                </p>
                <ul>
                  <li>You may need to log in repeatedly</li>
                  <li>Your preferences won't be saved</li>
                  <li>Some features may be unavailable</li>
                  <li>The platform may run slower</li>
                </ul>

                <h2>7. Cookie Consent</h2>
                <p>
                  When you first visit our platform, we'll ask for your consent to use non-essential cookies.
                  You can change your cookie preferences at any time through our cookie settings.
                </p>

                <h2>8. Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy to reflect changes in our practices or legal requirements.
                  We'll notify you of significant changes through our platform.
                </p>

                <h2>9. Contact Us</h2>
                <p>
                  If you have questions about our use of cookies, please contact us at:
                  <br />
                  Email: privacy@bowmaninsurance.com
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
