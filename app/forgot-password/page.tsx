// app/forgot-password/page.tsx   ← MAKE SURE THIS IS THE EXACT FILE PATH

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Building2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string }
}) {
  const { message, error } = searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back + Logo */}
        <div className="text-center mb-8">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
          <div className="flex items-center justify-center gap-2">
            <Building2 className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold">HRPro</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Forgot your password?</CardTitle>
            <CardDescription>
              Enter your email and we’ll send you a reset link
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {message && (
              <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 p-4 rounded-lg text-sm text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <p>{message}</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 bg-destructive/10 p-4 rounded-lg text-sm text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}

            <form
              action={async (formData) => {
                "use server"
                const email = formData.get("email")?.toString().trim()

                if (!email || !email.includes("@")) {
                  redirect(`/forgot-password?error=${encodeURIComponent("Please enter a valid email")}`)
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                })

                if (!res.ok) {
                  const err = await res.text()
                  redirect(`/forgot-password?error=${encodeURIComponent(err || "Failed to send reset link")}`)
                }

                redirect("/forgot-password?message=Check your email for the password reset link")
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="superadmin@demo.com"
                  required
                  autoFocus
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Send Reset Link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}