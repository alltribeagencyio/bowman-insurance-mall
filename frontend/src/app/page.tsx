import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Shield, Car, Heart, Home as HomeIcon, Plane, Users, Building2, CheckCircle2, TrendingUp, ArrowRight, Star } from 'lucide-react'

export default function Home() {
  // Featured products
  const featuredProducts = [
    {
      id: '1',
      name: 'Afya Plus Medical Plan',
      company: 'AAR Insurance',
      category: 'Medical',
      categoryIcon: Heart,
      premium: 12000,
      coverage: 5000000,
      rating: 4.8,
      features: ['Outpatient cover', 'Inpatient cover', 'Maternity', 'Dental & Optical'],
      badge: 'Most Popular',
    },
    {
      id: '2',
      name: 'Comprehensive Motor Cover',
      company: 'Jubilee Insurance',
      category: 'Motor',
      categoryIcon: Car,
      premium: 15000,
      coverage: 2000000,
      rating: 4.5,
      features: ['Accident cover', 'Third party liability', 'Theft protection', 'Roadside assistance'],
      badge: 'Best Value',
    },
    {
      id: '3',
      name: 'Whole Life Cover',
      company: 'Britam',
      category: 'Life',
      categoryIcon: Users,
      premium: 5000,
      coverage: 10000000,
      rating: 4.6,
      features: ['Death benefit', 'Savings plan', 'Loan facility', 'Tax benefits'],
      badge: 'Recommended',
    },
  ]

  const categories = [
    { icon: Car, name: 'Motor', desc: 'Comprehensive vehicle coverage', href: '/policies/motor', count: '15 policies' },
    { icon: Heart, name: 'Medical', desc: 'Health insurance plans', href: '/policies/medical', count: '12 policies' },
    { icon: Users, name: 'Life', desc: 'Life insurance protection', href: '/policies/life', count: '18 policies' },
    { icon: HomeIcon, name: 'Home', desc: 'Property insurance', href: '/policies/home', count: '10 policies' },
    { icon: Plane, name: 'Travel', desc: 'Travel protection', href: '/policies/travel', count: '8 policies' },
    { icon: Building2, name: 'Business', desc: 'Business assets', href: '/policies/business', count: '14 policies' },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Kenya's Premier Insurance Marketplace
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Compare, purchase, and manage insurance from Kenya's top providers. All in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/policies">
                  Browse All Insurance
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/quote">Get Instant Quote</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>15+ Insurance Providers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Instant Quotes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>M-Pesa Payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Featured Insurance Plans</h2>
            <p className="text-muted-foreground text-lg">
              Hand-picked top plans from Kenya's leading insurers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {featuredProducts.map((product) => {
              const CategoryIcon = product.categoryIcon
              return (
                <Card key={product.id} className="hover:shadow-xl transition-shadow relative overflow-hidden group">
                  {/* Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {product.badge}
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CategoryIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">{product.category} Insurance</div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription className="mt-1">{product.company}</CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-sm bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span className="font-medium text-amber-700 dark:text-amber-300">{product.rating}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold">
                        KES {product.premium.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Coverage</p>
                      <p className="font-semibold">
                        Up to KES {product.coverage.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Key Features</p>
                      <ul className="space-y-1">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/policies/details/${product.id}`}>
                        Details
                      </Link>
                    </Button>
                    <Button className="flex-1 group-hover:bg-primary/90">Get Quote</Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link href="/policies">
                View All Insurance Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Insurance Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground text-lg">
              Find the perfect insurance for your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
            {categories.map((category) => (
              <Link key={category.name} href={category.href}>
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full text-center group">
                  <CardContent className="pt-6 pb-6">
                    <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <category.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{category.desc}</p>
                    <p className="text-xs font-medium text-primary">{category.count}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Why Choose Bowman Insurance Mall?</h2>
            <p className="text-muted-foreground text-lg">
              Kenya's most trusted insurance comparison platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Trusted & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Licensed by IRA Kenya with bank-grade security for all transactions
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Instant Coverage</h3>
                <p className="text-sm text-muted-foreground">
                  Get quotes in seconds and activate your policy immediately
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Expert Support</h3>
                <p className="text-sm text-muted-foreground">
                  Dedicated team available 24/7 to help with claims and queries
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground max-w-4xl mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Get Protected?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of Kenyans who trust us with their insurance needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">Get Started Free</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="/policies">Browse Insurance</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
