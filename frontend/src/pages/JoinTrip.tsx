import { useCallback, useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, LogIn, MapPin } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { useAuth } from "@/contexts/AuthContext"
import { joinTrip } from "@/services/api.ts"
import type { JoinTripResponse } from "@/types/travel.ts"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent } from "@/components/ui/card.tsx"

type JoinStatus = "idle" | "loading" | "success" | "error"

export default function JoinTrip() {
  const navigate = useNavigate()
  const { inviteToken } = useParams()
  const { isAuthenticated } = useAuth()

  const [status, setStatus] = useState<JoinStatus>("idle")
  const [tripInfo, setTripInfo] = useState<JoinTripResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const handleJoin = useCallback(async () => {
    if (!inviteToken) {
      setStatus("error")
      setErrorMessage("Missing invite token.")
      return
    }

    setStatus("loading")

    try {
      const joinedTrip = await joinTrip(inviteToken)
      setTripInfo(joinedTrip)
      setStatus("success")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to join trip.")
      setStatus("error")
    }
  }, [inviteToken])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const timerId = window.setTimeout(() => {
      void handleJoin()
    }, 0)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [handleJoin, isAuthenticated])

  if (!isAuthenticated) {
    const redirectTarget = encodeURIComponent(`/join/${inviteToken ?? ""}`)

    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md border-none p-8 text-center shadow-2xl">
          <div className="mx-auto mb-6 w-fit rounded-2xl bg-blue-50 p-4">
            <LogIn className="h-10 w-10 text-blue-600" />
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900">You're Invited!</h2>
          <p className="mb-6 text-gray-500">
            Sign in to join this group trip and access the shared itinerary and group chat.
          </p>

          <Button
            onClick={() => navigate(`/login?redirect=${redirectTarget}`)}
            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            Sign In to Join
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md border-none p-8 text-center shadow-2xl">
        <CardContent className="space-y-6 p-0">
          {status === "loading" ? (
            <>
              <div className="mx-auto w-fit rounded-2xl bg-blue-50 p-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Joining Trip…</h2>
                <p className="mt-1 text-gray-400">Adding you to the group, please wait.</p>
              </div>
            </>
          ) : null}

          {status === "success" && tripInfo ? (
            <>
              <div className="mx-auto w-fit rounded-2xl bg-emerald-50 p-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-emerald-600">
                  {tripInfo.status === "already_joined" ? "Already Joined!" : "Successfully Joined!"}
                </p>
                <h2 className="mb-1 text-2xl font-bold text-gray-900">Trip to {tripInfo.destination}</h2>
                <p className="text-sm text-gray-400">
                  {tripInfo.days} days ·{" "}
                  {tripInfo.status === "already_joined"
                    ? "You are already a participant"
                    : "You are now a participant"}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-left">
                <MapPin className="shrink-0 text-blue-500" size={20} />
                <div>
                  <p className="text-sm font-semibold text-blue-800">{tripInfo.destination}</p>
                  <p className="text-xs text-blue-500">{tripInfo.days}-day itinerary available</p>
                </div>
              </div>

              <Button
                onClick={() => navigate("/itinerary", { state: { plan: tripInfo } })}
                className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
              >
                View Trip Itinerary
              </Button>
            </>
          ) : null}

          {status === "error" ? (
            <>
              <div className="mx-auto w-fit rounded-2xl bg-red-50 p-4">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">Invalid Invite</h2>
                <p className="mt-1 text-sm text-gray-400">{errorMessage}</p>
              </div>

              <Button variant="outline" onClick={() => navigate("/")} className="w-full rounded-xl font-bold">
                Back to Home
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
