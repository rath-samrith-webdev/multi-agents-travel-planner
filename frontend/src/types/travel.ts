export interface User {
  id: number
  username: string
  email?: string
  picture?: string | null
}

export type Participant = User

export interface TripActivity {
  time: string
  name: string
  cost: string
  notes?: string | null
}

export interface TripDay {
  day: number
  activities: TripActivity[]
}

export interface PlanMetadata {
  budget_checked?: boolean
  expert_curated?: boolean
  xai_reasoning?: string
  mem_context?: string | null
}

export interface Plan {
  id: number
  destination: string
  days: number
  budget?: number
  preferences?: string[]
  creator_id?: number | null
  metadata?: PlanMetadata
  itinerary?: TripDay[]
}

export interface RecentTrip {
  id: number
  destination: string
  date: string
}

export interface UserProfile extends User {
  preferences?: Record<string, boolean>
  recent_trips?: RecentTrip[]
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface JoinTripResponse extends Plan {
  status?: "joined" | "already_joined" | string
}

export interface GroupChatMessage {
  id: string | number
  type?: "message" | "system"
  user_id?: number
  username?: string
  picture?: string | null
  content: string
  timestamp: string
  optimistic?: boolean
}

export interface GroupChatUser {
  id: number
  username: string
  picture?: string | null
}

export interface GroupChatEvent {
  type: "history" | "message" | "user_joined" | "user_left" | "typing" | string
  id?: string | number
  user_id?: number
  username?: string
  user?: GroupChatUser
  content?: string
  timestamp?: string
  messages?: GroupChatMessage[]
  online_users?: GroupChatUser[]
}
