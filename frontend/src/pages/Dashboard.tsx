import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  Compass,
  History,
  LogOut,
  MapPin,
  PlusCircle,
  Star,
  User as UserIcon,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { useAuth } from "@/contexts/AuthContext"
import { getTrip, getUserProfile } from "@/services/api.ts"
import type { RecentTrip, UserProfile } from "@/types/travel.ts"
import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx"

export default function Dashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const nextProfile = await getUserProfile()
        setProfile(nextProfile)
      } catch (error) {
        console.error("Dashboard data fetch failed", error)
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [])

  async function handleViewPlan(tripId: number) {
    try {
      const fullTrip = await getTrip(tripId)
      navigate("/itinerary", { state: { plan: fullTrip } })
    } catch (error) {
      console.error("Failed to load full trip", error)
    }
  }

  const preferenceEntries = useMemo(
    () => Object.entries(profile?.preferences ?? {}).filter(([, value]) => Boolean(value)),
    [profile?.preferences]
  )

  const trips = profile?.recent_trips ?? []

  function renderTrips(items: RecentTrip[]) {
    if (items.length === 0) {
      return (
        <Card className="flex flex-col items-center justify-center border-2 border-dashed py-12 text-center">
          <div className="mb-4 rounded-full bg-gray-50 p-4">
            <Compass size={32} className="text-gray-300" />
          </div>
          <CardTitle className="text-gray-400">No journeys logged yet</CardTitle>
          <CardDescription className="mb-6">Start your first adventure today.</CardDescription>
          <Link to="/">
            <Button className="rounded-xl bg-blue-600 font-bold hover:bg-blue-700">Create First Trip</Button>
          </Link>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {items.map((trip) => (
          <Card
            key={trip.id}
            className="group cursor-pointer overflow-hidden border-none ring-1 ring-gray-100 transition-all hover:shadow-xl"
          >
            <CardContent className="flex flex-col p-0 sm:flex-row">
              <div className="flex items-center justify-center bg-gray-50 p-6 sm:w-32 sm:border-r sm:border-gray-100 group-hover:bg-blue-50">
                <MapPin size={32} className="text-gray-400 group-hover:text-blue-500" />
              </div>

              <div className="flex flex-grow flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{trip.destination}</h4>
                  <p className="font-medium text-gray-500">{new Date(trip.date).toLocaleDateString()}</p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleViewPlan(trip.id)}
                  className="rounded-xl font-bold transition-all group-hover:bg-blue-600 group-hover:text-white"
                >
                  View Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl md:flex-row md:items-center">
        <div className="flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-white/20 shadow-inner">
            {profile?.picture ? (
              <img src={profile.picture} alt={profile.username} className="h-full w-full object-cover" />
            ) : (
              <UserIcon size={48} />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight">{profile?.username || "Explorer"}</h1>

              {profile?.email?.includes("example.com") && profile?.username?.toLowerCase().includes("demo") ? (
                <Badge className="rounded-md border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200">
                  Demo Account
                </Badge>
              ) : (
                <Badge className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                  <CheckCircle2 size={12} />
                  Google Verified
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium opacity-80">{profile?.email}</p>
            <p className="text-sm opacity-70">Unlocking the world, one agent at a time.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={logout}
            variant="secondary"
            className="gap-2 rounded-xl border border-white/10 bg-white/10 font-bold text-white hover:bg-white/20"
          >
            <LogOut size={18} />
            Logout
          </Button>

          <Link to="/">
            <Button className="gap-2 rounded-xl bg-white font-bold text-blue-700 hover:bg-gray-100">
              <PlusCircle size={18} />
              New Trip
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="border-none shadow-lg ring-1 ring-gray-100 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              Preferences
            </CardTitle>
            <CardDescription>Your saved travel DNA</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {preferenceEntries.map(([key]) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="rounded-lg border-none bg-blue-50 px-3 py-1 text-sm font-medium capitalize text-blue-700 hover:bg-blue-100"
                >
                  {key}
                </Badge>
              ))}
            </div>

            <Button variant="ghost" className="mt-6 w-full rounded-xl font-bold text-blue-600 hover:bg-blue-50">
              Edit Preferences
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="recent" className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
                <History className="text-blue-600" size={24} />
                Journey Logs
              </h2>

              <TabsList className="rounded-xl bg-gray-100/50 p-1">
                <TabsTrigger value="recent" className="rounded-lg px-4 font-bold">
                  Recent
                </TabsTrigger>
                <TabsTrigger value="all" className="rounded-lg px-4 font-bold">
                  All Trips
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="recent">{renderTrips(trips)}</TabsContent>
            <TabsContent value="all">{renderTrips(trips)}</TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}