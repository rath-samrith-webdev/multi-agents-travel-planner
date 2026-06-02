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
          <div className="w-full max-w-md space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Privacy & Consent</h3>
                <p className="text-xs text-gray-500">Google authentication disclosure</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <p>We only request the profile data needed to create your account and save itineraries.</p>

              <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 shrink-0 text-blue-500" size={16} />
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Email Address</span>
                    <span className="text-xs text-gray-500">Used as your account identifier.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="mt-0.5 shrink-0 text-blue-500" size={16} />
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Public Name</span>
                    <span className="text-xs text-gray-500">Used in your dashboard and shared trip chat.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Image className="mt-0.5 shrink-0 text-blue-500" size={16} />
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Profile Picture</span>
                    <span className="text-xs text-gray-500">Used as your avatar across the app.</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacyNotice(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700"
            >
              I Understand & Accept
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : null}

      <Card className="w-full max-w-md border-none bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 shadow-inner">
            <Compass className="h-8 w-8 animate-pulse text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome to AI Travel Planner
          </CardTitle>
          <p className="text-sm text-gray-500">Sign in to start planning your next adventure.</p>
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
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 flex-shrink text-xs font-semibold uppercase tracking-wider text-gray-400">
              or
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <button
            onClick={handleDemoLogin}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
          >
            <Compass className="h-4 w-4 text-blue-600" />
            Continue with Demo Account
          </button>
        </CardContent>
      </Card>
    </div>
  )
}