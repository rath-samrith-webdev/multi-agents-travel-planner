import { useState } from "react"
import type { CredentialResponse } from "@react-oauth/google"
import { GoogleLogin } from "@react-oauth/google"
import { ArrowRight, Compass, Image, Mail, ShieldCheck, User } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { useAuth } from "@/contexts/AuthContext"
import { googleLogin } from "@/services/api.ts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true)

  const redirectTo = searchParams.get("redirect") ?? "/"

  async function handleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      alert("Google credential missing.")
      return
    }

    try {
      const data = await googleLogin(credentialResponse.credential)
      login(data.access_token, data.user)
      navigate(redirectTo)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed."
      console.error("Error during Google login:", error);
      alert(message)
    }
  }

  async function handleDemoLogin() {
    try {
      const data = await googleLogin("mock_demo_user@example.com")
      login(data.access_token, data.user)
      navigate(redirectTo)
    } catch {
      alert("Demo authentication failed. Please try again.")
    }
  }

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center">
      {showPrivacyNotice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-6 shadow-2xl md:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Privacy & Consent</h3>
                <p className="text-xs text-muted-foreground">Google authentication disclosure</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <p>We only request the profile data needed to create your account and save itineraries.</p>

              <div className="space-y-3 rounded-2xl border border-border bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 shrink-0 text-primary" size={16} />
                  <div>
                    <span className="block text-xs font-bold text-foreground">Email Address</span>
                    <span className="text-xs text-muted-foreground">Used as your account identifier.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="mt-0.5 shrink-0 text-primary" size={16} />
                  <div>
                    <span className="block text-xs font-bold text-foreground">Public Name</span>
                    <span className="text-xs text-muted-foreground">Used in your dashboard and shared trip chat.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Image className="mt-0.5 shrink-0 text-primary" size={16} />
                  <div>
                    <span className="block text-xs font-bold text-foreground">Profile Picture</span>
                    <span className="text-xs text-muted-foreground">Used as your avatar across the app.</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacyNotice(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
            >
              I Understand & Accept
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : null}

      <Card className="w-full max-w-md border-none bg-card/80 p-8 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-inner">
            <Compass className="h-8 w-8 animate-pulse text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Welcome to AI Travel Planner
          </CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to start planning your next adventure.</p>
        </CardHeader>

        <CardContent className="mt-6 flex flex-col items-center space-y-4">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => alert("Google login failed. Please try again.")}
            useOneTap
            theme="filled_blue"
            shape="pill"
          />

          <div className="flex w-full items-center py-2">
            <div className="flex-grow border-t border-border" />
            <span className="mx-4 flex-shrink text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              or
            </span>
            <div className="flex-grow border-t border-border" />
          </div>

          <button
            onClick={handleDemoLogin}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted hover:shadow-md"
          >
            <Compass className="h-4 w-4 text-primary" />
            Continue with Demo Account
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
