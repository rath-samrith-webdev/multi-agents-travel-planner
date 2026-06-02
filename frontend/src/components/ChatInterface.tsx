import type { FormEvent } from "react"
import { useState } from "react"
import { Send, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { modifyPlanChat } from "@/services/api"
import type { TripDay } from "@/types/travel"

interface ChatInterfaceProps {
  tripId: number
  onUpdate: (newItinerary: TripDay[]) => void
}

export default function ChatInterface({ tripId, onUpdate }: ChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!message.trim()) {
      return
    }

    setLoading(true)

    try {
      const response = await modifyPlanChat(tripId, message)

      if (response.status === "success") {
        onUpdate(response.itinerary)
        setMessage("")
      }
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Failed to update itinerary."
      alert(messageText)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
      <div className="flex items-center gap-2 bg-blue-600 p-4 text-white">
        <Sparkles size={20} />
        <h3 className="font-bold">Adjust Your Trip</h3>
      </div>

      <div className="p-4">
        <p className="mb-4 text-sm text-muted-foreground">
          Ask the AI to add a museum, find a cheaper lunch, or change the pace of your day.
        </p>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="e.g. Add more culture to day 2..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="h-11 rounded-xl border-gray-200 bg-gray-50"
          />
          <Button type="submit" size="icon" disabled={loading} className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  )
}