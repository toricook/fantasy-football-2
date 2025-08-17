"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Add this debug code to your login page temporarily
// Replace the handleSubmit function with this enhanced version

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError("")

  console.log("🔍 LOGIN DEBUG START")
  console.log("📧 Email:", email)
  console.log("🔑 Password length:", password.length)
  console.log("🔑 Password:", password) // Remove this after debugging!

  try {
    console.log("📤 Calling signIn...")
    const result = await signIn("credentials", {
      email: email.trim(), // Remove any spaces
      password,
      redirect: false,
    })

    console.log("📥 SignIn result:", result)

    if (result?.error) {
      console.log("❌ SignIn error:", result.error)
      console.log("❌ Full result object:", JSON.stringify(result, null, 2))
      setError("Invalid email or password")
    } else {
      console.log("✅ SignIn success!")
      
      // Check if user has a league
      const session = await getSession()
      console.log("📋 Session after login:", session)
      
      if (session?.user?.leagueId) {
        console.log("🏈 User has league, redirecting to home")
        router.push("/")
      } else {
        console.log("❌ User has no league, redirecting to join-league")
        // User needs to join a league
        router.push("/join-league")
      }
    }
  } catch (err) {
    console.log("❌ Catch error:", err)
    setError("Something went wrong. Please try again.")
  } finally {
    setIsLoading(false)
    console.log("🔍 LOGIN DEBUG END")
  }
}
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your fantasy football league
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}