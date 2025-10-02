import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Calculator, Clock, CheckCircle, Star, ArrowRight, Menu } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">HRPro</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About Us
            </Link>
            <Link
              href="#demo"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Demo
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Trusted by 500+ Companies
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            The All-In-One HR Platform for Your Business
          </h1>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Streamline your HR operations with our comprehensive platform. Manage employees, process payroll, track
            attendance, and handle leave requests all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to manage your workforce</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive HR platform provides all the tools you need to efficiently manage your employees and
              streamline operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Payroll Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automated payroll processing with tax calculations, deductions, and compliance reporting.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Employee Onboarding</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Streamlined onboarding process with digital forms, document management, and task tracking.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Attendance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real-time attendance monitoring with flexible scheduling and overtime calculations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Leave Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Efficient leave request system with approval workflows and balance tracking.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Demo Section */}
      <section id="demo" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See HRPro in Action</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover how our platform streamlines HR operations with real-world scenarios and interactive demos.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-4">Employee Management Made Simple</h3>
              <p className="text-muted-foreground mb-6">
                Manage your entire workforce from a single dashboard. Add new employees, track their progress, and
                maintain comprehensive employee records with ease.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span>Complete employee profiles with documents</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span>Department and role management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span>Performance tracking and reviews</span>
                </li>
              </ul>
            </div>
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="bg-background rounded border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Employee Directory</h4>
                  <Badge variant="secondary">Live Demo</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-muted/50 rounded">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary-foreground">JD</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">John Doe</p>
                      <p className="text-xs text-muted-foreground">Software Engineer</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-muted/50 rounded">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary-foreground">AS</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Alice Smith</p>
                      <p className="text-xs text-muted-foreground">HR Manager</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="lg:order-2">
              <h3 className="text-2xl font-bold mb-4">Automated Payroll Processing</h3>
              <p className="text-muted-foreground mb-6">
                Process payroll with confidence. Our system handles complex calculations, tax deductions, and compliance
                requirements automatically.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span>Automated salary calculations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span>Tax compliance and reporting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span>Direct deposit and pay stubs</span>
                </li>
              </ul>
            </div>
            <div className="lg:order-1 bg-muted/50 rounded-lg p-6">
              <div className="bg-background rounded border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Payroll Summary</h4>
                  <Badge variant="secondary">Live Demo</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Total Employees</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Gross Pay</span>
                    <span className="font-semibold">₹12,45,000</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Deductions</span>
                    <span className="font-semibold">₹2,15,000</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-primary/10 rounded border-l-4 border-primary">
                    <span className="text-sm font-medium">Net Pay</span>
                    <span className="font-bold">₹10,30,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Smart Attendance Tracking</h3>
              <p className="text-muted-foreground mb-6">
                Monitor attendance in real-time with flexible tracking options. Support for remote work, flexible
                schedules, and overtime calculations.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span>Real-time clock in/out tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span>Flexible work schedules</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span>Overtime and break management</span>
                </li>
              </ul>
            </div>
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="bg-background rounded border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Today's Attendance</h4>
                  <Badge variant="secondary">Live Demo</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-2xl font-bold text-green-600">142</p>
                    <p className="text-xs text-green-600">Present</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <p className="text-2xl font-bold text-red-600">8</p>
                    <p className="text-xs text-red-600">Absent</p>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <p className="text-2xl font-bold text-yellow-600">6</p>
                    <p className="text-xs text-yellow-600">Late</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Attendance Rate: 91.0%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-2">No credit card required • 14-day free trial</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by businesses worldwide</h2>
            <p className="text-xl text-muted-foreground">See what our customers have to say about HRPro</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "HRPro has transformed our HR operations. The payroll automation alone saves us 10 hours per month."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary-foreground">SJ</span>
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">HR Director, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The employee onboarding feature is fantastic. New hires are productive from day one."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary-foreground">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold">Michael Rodriguez</p>
                    <p className="text-sm text-muted-foreground">CEO, StartupXYZ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Excellent platform with outstanding customer support. Highly recommended for growing businesses."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary-foreground">EP</span>
                  </div>
                  <div>
                    <p className="font-semibold">Emily Parker</p>
                    <p className="text-sm text-muted-foreground">Operations Manager, GrowthCo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">HRPro</span>
              </div>
              <p className="text-muted-foreground">The complete HR solution for modern businesses.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 HRPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
