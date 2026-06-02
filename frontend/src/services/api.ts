import type {
  AuthResponse,
  JoinTripResponse,
  Participant,
  Plan,
  TripDay,
  UserProfile,
} from "@/types/travel"

interface GenerateTripPayload {
  user_id?: number
  destination: string
  days: number
  budget: number
  preferences: string[]
}

interface ModifyPlanResponse {
  status: string
  itinerary: TripDay[]
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api"
export const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL ?? "ws://127.0.0.1:8000/api/chat/ws"

function getStoredToken() {
  return localStorage.getItem("token")
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T
  }

  const isJson = response.headers.get("content-type")?.includes("application/json")
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.detail || payload?.message || "Request failed"

    throw new Error(message)
  }

  return payload as T
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  requiresAuth = true
): Promise<T> {
  const headers = new Headers(init.headers)

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (requiresAuth) {
    const token = getStoredToken()

    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  return parseResponse<T>(response)
}

export async function googleLogin(googleToken: string) {
  return apiRequest<AuthResponse>(
    "/auth/google",
    {
      method: "POST",
      body: JSON.stringify({ token: googleToken }),
    },
    false
  )
}

export async function generateTrip(tripData: GenerateTripPayload) {
  return apiRequest<Plan>("/trips/generate", {
    method: "POST",
    body: JSON.stringify(tripData),
  })
}

export async function getTrip(tripId: number) {
  return apiRequest<Plan>(`/trips/${tripId}`)
}

export async function modifyPlanChat(tripId: number, message: string) {
  const encodedMessage = encodeURIComponent(message)

  return apiRequest<ModifyPlanResponse>(
    `/trips/chat?trip_id=${tripId}&message=${encodedMessage}`,
    {
      method: "POST",
    }
  )
}

export async function getUserProfile() {
  return apiRequest<UserProfile>("/users/me")
}

export async function getInviteLink(tripId: number) {
  return apiRequest<{ invite_token: string }>(`/trips/${tripId}/invite-link`)
}

export async function joinTrip(inviteToken: string) {
  return apiRequest<JoinTripResponse>(`/trips/join/${inviteToken}`, {
    method: "POST",
  })
}

export async function getTripParticipants(tripId: number) {
  return apiRequest<Participant[]>(`/trips/${tripId}/participants`)
}