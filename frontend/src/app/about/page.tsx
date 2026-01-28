import { Card, CardContent } from '@/components/ui/card'
import { Shield, Users, TrendingUp, Award, CheckCircle2 } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Bowman Insurance Mall
            </h1>
            <p className="text-xl text-muted-foreground">
              Kenya's Premier Insurance Marketplace - Making Insurance Accessible to Everyone
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-8 pb-6">
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  To revolutionize the insurance industry in Kenya by providing a transparent,
                  accessible, and user-friendly platform that empowers individuals and businesses
                  to make informed insurance decisions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-8 pb-6">
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground">
                  To become the leading insurance marketplace in East Africa, trusted by millions
                  for comprehensive coverage comparison, instant quotes, and seamless policy management.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Bowman Insurance Mall?</h2>
            <p className="text-muted-foreground text-lg">
              We're committed to making insurance simple, transparent, and accessible
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Trusted Platform</h3>
                <p className="text-sm text-muted-foreground">
                  Licensed by IRA Kenya with bank-grade security
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">15+ Partners</h3>
                <p className="text-sm text-muted-foreground">
                  Access to Kenya's leading insurance providers
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Instant Coverage</h3>
                <p className="text-sm text-muted-foreground">
                  Get quotes in seconds, activate immediately
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Expert Support</h3>
                <p className="text-sm text-muted-foreground">
                  24/7 dedicated team for claims and queries
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Core Values</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Transparency</h3>
                  <p className="text-muted-foreground">
                    We believe in clear, honest communication about insurance products, pricing, and terms.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Customer First</h3>
                  <p className="text-muted-foreground">
                    Your needs drive everything we do. We're here to serve you, not sell to you.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Innovation</h3>
                  <p className="text-muted-foreground">
                    We continuously improve our platform with cutting-edge technology for better user experience.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Integrity</h3>
                  <p className="text-muted-foreground">
                    We maintain the highest ethical standards in all our business dealings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
