import { useEffect, useMemo, useState } from "react"
import {
  Check,
  Clock,
  DollarSign,
  Info,
  Map as MapIcon,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  Zap,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import ChatInterface from "@/components/ChatInterface.tsx"
import GroupChat from "@/components/GroupChat.tsx"
import MapComponent from "@/components/MapComponent.tsx"
import { useAuth } from "@/contexts/AuthContext"
import { getInviteLink, getTripParticipants } from "@/services/api.ts"
import type { Participant, Plan } from "@/types/travel.ts"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx"

interface ItineraryLocationState {
  plan?: Plan
}

export default function Itinerary() {
  const location = useLocation()
  const { user } = useAuth()

  const initialPlan = (location.state as ItineraryLocationState | null)?.plan ?? null
  const [plan, setPlan] = useState<Plan | null>(initialPlan)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadParticipants() {
      if (!plan?.id) {
        return
      }

      try {
        const nextParticipants = await getTripParticipants(plan.id)
        setParticipants(nextParticipants)
      } catch (error) {
        console.error("Failed to load participants", error)
      }
    }

    void loadParticipants()
  }, [plan?.id])

  const isCreator = useMemo(
    () => Boolean(user && plan?.creator_id && user.id === plan.creator_id),
    [plan?.creator_id, user]
  )

  async function handleCopyInviteLink() {
    if (!plan?.id) {
      return
    }

    try {
      const { invite_token: inviteToken } = await getInviteLink(plan.id)
      const inviteUrl = `${window.location.origin}/join/${inviteToken}`

      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to copy invite link", error)
    }
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-6">
          <MapIcon size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700">No Itinerary Found</h2>
        <p className="mt-2 max-w-sm text-gray-500">Generate a new trip to start planning your adventure.</p>
        <Link to="/">
          <Button className="mt-6 rounded-2xl bg-blue-600 px-8 py-6 text-lg font-bold hover:bg-blue-700">
            Generate New Trip
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <Card className="overflow-hidden border-none shadow-2xl ring-1 ring-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <h1 className="mb-2 text-4xl font-extrabold">Trip to {plan.destination}</h1>
              <div className="flex items-center gap-3 opacity-90">
                <Badge variant="secondary" className="border-none bg-white/20 px-3 py-1 text-white">
                  {plan.days} Days
                </Badge>
                <span className="text-lg font-medium">Full Multi-Agent Experience</span>
              </div>
            </div>

            <div className="hidden gap-4 md:flex">
              <Badge className="flex items-center gap-1.5 rounded-xl border-green-500/30 bg-green-500/20 px-4 py-2 text-green-100">
                <ShieldCheck size={16} />
                {plan.metadata?.budget_checked ? "Budget Safe" : "Optimizing"}
              </Badge>
              <Badge className="flex items-center gap-1.5 rounded-xl border-amber-500/30 bg-amber-500/20 px-4 py-2 text-amber-100">
                <Zap size={16} />
                {plan.metadata?.expert_curated ? "Expert Curated" : "Standard"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="border-b border-blue-100/50 bg-blue-50/30 p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-blue-100 p-1.5 text-blue-600">
              <Info size={16} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-800">
              Explainable AI Insight
            </h3>
          </div>

          <p className="text-sm italic leading-relaxed text-blue-900/80">
            "
            {plan.metadata?.xai_reasoning ||
              "Planner, Budget, and Expert agents collaborated to balance destination flow, cost, and local quality."}
            "
          </p>

          {plan.metadata?.mem_context ? (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-blue-200/50 bg-white p-4 text-xs text-blue-700 shadow-sm">
              <div>🧠</div>
              <div>
                <strong>Past memory context applied:</strong> {plan.metadata.mem_context}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Accordion type="multiple" defaultValue={["day-1"]} className="space-y-4">
            {plan.itinerary?.map((dayPlan) => (
              <AccordionItem
                key={dayPlan.day}
                value={`day-${dayPlan.day}`}
                className="overflow-hidden rounded-2xl border-none bg-white shadow-md ring-1 ring-gray-100"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                  <div className="flex w-full items-center justify-between pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                        {dayPlan.day}
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">Day {dayPlan.day}</h4>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="space-y-6 px-6 pb-6 pt-2">
                  {dayPlan.activities?.map((activity, activityIndex) => (
                    <div
                      key={`${dayPlan.day}-${activityIndex}`}
                      className="relative border-l-2 border-blue-100 pb-8 pl-8 last:border-0 last:pb-2"
                    >
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-md" />

                      <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className="flex w-fit items-center gap-1 border-blue-200 px-2 text-[10px] font-bold uppercase text-blue-600"
                          >
                            <Clock size={10} />
                            {activity.time}
                          </Badge>
                          <h5 className="text-lg font-extrabold text-gray-900">{activity.name}</h5>
                        </div>

                        <Badge className="flex shrink-0 items-center gap-1 border-none bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                          <DollarSign size={14} />
                          {activity.cost}
                        </Badge>
                      </div>

                      {activity.notes ? (
                        <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 text-sm text-gray-600">
                          <span className="shrink-0 text-blue-500">💡</span>
                          <p className="italic leading-relaxed">{activity.notes}</p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="space-y-8">
          <div className="sticky top-8 space-y-8">
            <Card className="overflow-hidden border-none shadow-lg ring-1 ring-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <MapIcon className="text-blue-600" size={24} />
                  Interactive Map
                </CardTitle>
                <CardDescription>Visualizing your generated route</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <MapComponent destination={plan.destination} />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none bg-slate-50/30 shadow-lg ring-1 ring-gray-100">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Users className="text-blue-600" size={24} />
                    Group Members
                  </CardTitle>
                  <CardDescription>Collaborating on this trip</CardDescription>
                </div>

                {isCreator ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyInviteLink}
                    className="flex items-center gap-2 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    {copied ? <Check size={16} className="text-green-600" /> : <UserPlus size={16} />}
                    {copied ? "Copied!" : "Invite Link"}
                  </Button>
                ) : null}
              </CardHeader>

              <CardContent className="flex flex-wrap gap-2 p-4 pt-0">
                {participants.map((participant) => {
                  const isCurrentUser = participant.id === user?.id
                  const isTripCreator = participant.id === plan.creator_id

                  return (
                    <Badge
                      key={participant.id}
                      variant={isCurrentUser ? "secondary" : "outline"}
                      className={
                        isCurrentUser
                          ? "flex items-center gap-2 rounded-full border-none bg-blue-600 px-3 py-1.5 text-white"
                          : "flex items-center gap-2 rounded-full border-gray-200 bg-white px-3 py-1.5 text-gray-600"
                      }
                    >
                      {participant.picture ? (
                        <img
                          src={participant.picture}
                          alt={participant.username}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={
                            isCurrentUser
                              ? "flex h-5 w-5 items-center justify-center rounded-full bg-blue-400 text-[10px] text-white"
                              : "flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-600"
                          }
                        >
                          {participant.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {participant.username}
                      {isCurrentUser ? " (You)" : ""}
                      {isTripCreator ? <Sparkles size={12} className="ml-1 text-yellow-400" /> : null}
                    </Badge>
                  )
                })}
              </CardContent>
            </Card>

            <GroupChat tripId={plan.id} />

            <Card className="overflow-hidden border-none shadow-lg ring-1 ring-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Sparkles className="text-blue-600" size={24} />
                  AI Agent Chat
                </CardTitle>
                <CardDescription>Ask agents to adjust your plan</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ChatInterface
                  tripId={plan.id}
                  onUpdate={(newItinerary) => {
                    setPlan((current) => (current ? { ...current, itinerary: newItinerary } : current))
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}