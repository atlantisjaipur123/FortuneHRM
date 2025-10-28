import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { loginAction } from "@/app/actions/auth"
import { getSession } from "@/app/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // Redirect if already logged in
  const session = await getSession()
  if (session) {
    if (session.role === "super_admin") {
      redirect("/super-admin")
    } else if (session.companyId) {
      redirect("/dashboard")
    } else {
      redirect("/onboarding")
    }
  }

  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-6 sm:mb-8">
          <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <span className="text-xl sm:text-2xl font-bold text-foreground">HRPro</span>
        </div>

        <Card>
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl">Welcome back</CardTitle>
            <CardDescription className="text-sm sm:text-base">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            {error && (
              <div className="flex items-center space-x-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <form action={async (formData) => {
              'use server'
              try {
                await loginAction(formData)
              } catch (error) {
                redirect(`/login?error=${encodeURIComponent(error instanceof Error ? error.message : 'Login failed')}`)
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  required 
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  required 
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <Link href="/forgot-password" className="text-xs sm:text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full h-10 sm:h-11" size="lg">
                <span className="text-sm sm:text-base">Sign In</span>
              </Button>
            </form>

            <div className="text-center text-xs sm:text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>

            {/* Demo credentials */}
           
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
