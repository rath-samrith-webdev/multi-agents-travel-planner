import type { FormEvent } from "react"
import { useState } from "react"
import { Calendar, DollarSign, Heart, MapPin, PlaneTakeoff, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "@/contexts/AuthContext"
import { generateTrip } from "@/services/api.ts"
import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"

const PREFERENCE_OPTIONS = [
  "Culture",
  "Food",
  "Nature",
  "Luxury",
  "Budget",
  "History",
  "Adventure",
  "Relaxation",
]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [destination, setDestination] = useState("")
  const [budget, setBudget] = useState("1000")
  const [days, setDays] = useState("3")
  const [preferences, setPreferences] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  function togglePreference(preference: string) {
    setPreferences((current) =>
      current.includes(preference)
        ? current.filter((item) => item !== preference)
        : [...current, preference]
    )
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const trip = await generateTrip({
        user_id: user?.id ?? 1,
        destination,
        days: Number(days),
        budget: Number(budget),
        preferences,
      })

      navigate("/itinerary", { state: { plan: trip } })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate trip."
      alert(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-gray-50/50 px-4 py-12">
      <div className="mb-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600 shadow-sm">
          <PlaneTakeoff size={16} />
          Multi-Agent AI Travel Planner
        </div>

        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
          Where to{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Next?
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-500">
          Planner, Budget, and Local Expert agents collaborate to draft a travel plan tailored to you.
        </p>
      </div>

      <Card className="w-full max-w-xl border-none shadow-2xl ring-1 ring-gray-200/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Trip Details</CardTitle>
          <CardDescription>Enter your preferences and let the agents build the itinerary.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-full space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin size={16} className="text-blue-500" />
                  Destination
                </label>
                <Input
                  required
                  placeholder="e.g. Kyoto, Japan"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  className="h-12 rounded-xl bg-gray-50/50"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <DollarSign size={16} className="text-blue-500" />
                  Budget ($)
                </label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  className="h-12 rounded-xl bg-gray-50/50"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Calendar size={16} className="text-blue-500" />
                  Duration (Days)
                </label>
                <Input
                  type="number"
                  value={days}
                  onChange={(event) => setDays(event.target.value)}
                  className="h-12 rounded-xl bg-gray-50/50"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Heart size={16} className="text-pink-500" />
                Preferences
              </label>

              <div className="flex flex-wrap gap-2">
                {PREFERENCE_OPTIONS.map((preference) => {
                  const selected = preferences.includes(preference)

                  return (
                    <Badge
                      key={preference}
                      variant={selected ? "default" : "secondary"}
                      className={selected ? "cursor-pointer rounded-full bg-blue-600 px-4 py-1.5" : "cursor-pointer rounded-full bg-gray-100 px-4 py-1.5 hover:bg-gray-200"}
                      onClick={() => togglePreference(preference)}
                    >
                      {preference}
                    </Badge>
                  )
                })}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !destination.trim()}
              className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-lg font-bold shadow-lg hover:scale-[1.01]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles size={18} className="animate-pulse" />
                  AI Agents Collaborating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles size={18} />
                  Generate My Adventure
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}