import type { FormEvent } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Circle, MessageSquare, Send, Wifi, WifiOff } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { WS_BASE_URL } from "@/services/api.ts"
import type {
  GroupChatEvent,
  GroupChatMessage,
  GroupChatUser,
} from "@/types/travel.ts"
import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"

const TYPING_TIMEOUT_MS = 2000
const RECONNECT_DELAYS = [1000, 2000, 5000, 10000]

interface GroupChatProps {
  tripId: number
}

export default function GroupChat({ tripId }: GroupChatProps) {
  const { token, user } = useAuth()
  const [messages, setMessages] = useState<GroupChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<GroupChatUser[]>([])
  const [whoIsTyping, setWhoIsTyping] = useState<
    Array<{ user_id: number | undefined; username: string | undefined }>
  >([])
  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting")

  const wsRef = useRef<WebSocket | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const mountedRef = useRef(false)
  const reconnectAttemptRef = useRef(0)

  const connected = status === "connected"

  const appendSystemMessage = useCallback((content: string) => {
    setMessages((current) => [
      ...current,
      {
        id: `system-${Date.now()}-${Math.random()}`,
        type: "system",
        content,
        timestamp: new Date().toISOString(),
      },
    ])
  }, [])

  const handleServerEvent = useCallback(
    (data: GroupChatEvent) => {
      switch (data.type) {
        case "history":
          setMessages(data.messages ?? [])
          setOnlineUsers(data.online_users ?? [])
          break

        case "message":
          setMessages((current) => {
            const alreadyExists = current.some(
              (message) => message.id === data.id
            )

            if (alreadyExists || !data.content) {
              return current
            }

            return [
              ...current,
              {
                id: data.id ?? `message-${Date.now()}`,
                type: "message",
                user_id: data.user_id,
                username: data.username,
                content: data.content,
                picture: data.user?.picture,
                timestamp: data.timestamp ?? new Date().toISOString(),
              },
            ]
          })

          if (data.user_id) {
            setWhoIsTyping((current) =>
              current.filter(
                (typingUser) => typingUser.user_id !== data.user_id
              )
            )
          }
          break

        case "user_joined":
          setOnlineUsers(data.online_users ?? [])
          appendSystemMessage(
            `${data.user?.username ?? "A traveler"} joined the chat`
          )
          break

        case "user_left":
          setOnlineUsers(data.online_users ?? [])
          appendSystemMessage(
            `${data.user?.username ?? "A traveler"} left the chat`
          )
          break

        case "typing":
          if (!data.user_id || !data.username) {
            break
          }

          setWhoIsTyping((current) => {
            const exists = current.some(
              (typingUser) => typingUser.user_id === data.user_id
            )
            return exists
              ? current
              : [...current, { user_id: data.user_id, username: data.username }]
          })

          window.setTimeout(() => {
            setWhoIsTyping((current) =>
              current.filter(
                (typingUser) => typingUser.user_id !== data.user_id
              )
            )
          }, TYPING_TIMEOUT_MS + 500)
          break

        default:
          break
      }
    },
    [appendSystemMessage]
  )

  const connect = useCallback(
    function connectToChat() {
      if (!tripId || !token || !mountedRef.current) {
        return
      }

      setStatus("connecting")

      const ws = new WebSocket(`${WS_BASE_URL}/${tripId}?token=${token}`)
      wsRef.current = ws

      ws.onopen = () => {
        reconnectAttemptRef.current = 0
        setStatus("connected")
      }

      ws.onmessage = (event) => {
        try {
          handleServerEvent(JSON.parse(event.data) as GroupChatEvent)
        } catch (error) {
          console.error("Failed to parse WebSocket payload", error)
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error", error)
      }

      ws.onclose = () => {
        if (!mountedRef.current) {
          return
        }

        setStatus("disconnected")

        const nextAttemptIndex = Math.min(
          reconnectAttemptRef.current,
          RECONNECT_DELAYS.length - 1
        )
        const reconnectDelay = RECONNECT_DELAYS[nextAttemptIndex]
        reconnectAttemptRef.current += 1

        reconnectTimerRef.current = window.setTimeout(
          connectToChat,
          reconnectDelay
        )
      }
    },
    [handleServerEvent, token, tripId]
  )

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false

      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current)
      }

      wsRef.current?.close()
    }
  }, [connect])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, whoIsTyping])

  const onlineCountLabel = useMemo(
    () => `${onlineUsers.length} online`,
    [onlineUsers.length]
  )

  function handleTyping(value: string) {
    setNewMessage(value)

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "typing" }))
    }
  }

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const content = newMessage.trim()

    if (!content || wsRef.current?.readyState !== WebSocket.OPEN) {
      return
    }

    setMessages((current) => [
      ...current,
      {
        id: `optimistic-${Date.now()}`,
        type: "message",
        user_id: user?.id,
        username: user?.username,
        picture: user?.picture,
        content,
        timestamp: new Date().toISOString(),
        optimistic: true,
      },
    ])

    setNewMessage("")
    wsRef.current.send(JSON.stringify({ type: "message", content }))
  }

  return (
    <Card className="flex h-[520px] flex-col overflow-hidden border-blue-100 shadow-xl">
      <CardHeader className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <MessageSquare size={18} />
            Group Discussion
          </CardTitle>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold",
                connected
                  ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-100"
                  : status === "connecting"
                    ? "border border-amber-500/30 bg-amber-500/20 text-amber-100"
                    : "border border-red-500/30 bg-red-500/20 text-red-100"
              )}
            >
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {connected
                ? "Live"
                : status === "connecting"
                  ? "Connecting…"
                  : "Reconnecting…"}
            </span>

            <Badge
              variant="secondary"
              className="border-white/20 bg-white/15 text-white"
            >
              {onlineCountLabel}
            </Badge>
          </div>
        </div>

        {onlineUsers.length > 0 ? (
          <div className="mt-2 flex items-center gap-1">
            {onlineUsers.slice(0, 8).map((onlineUser) => (
              <div
                key={onlineUser.id}
                className="relative"
                title={onlineUser.username}
              >
                <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-blue-400 text-[10px] font-bold text-white">
                  {onlineUser.picture ? (
                    <img
                      src={onlineUser.picture}
                      alt={onlineUser.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    onlineUser.username[0]?.toUpperCase()
                  )}
                </div>
                <Circle
                  size={8}
                  className="absolute -right-0.5 -bottom-0.5 fill-emerald-400 text-emerald-400"
                />
              </div>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <CardContent
        ref={scrollRef}
        className="flex-grow space-y-3 overflow-y-auto bg-slate-50/50 p-4"
      >
        {messages.length === 0 && connected ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground opacity-50">
            <MessageSquare size={48} strokeWidth={1} />
            <p className="text-sm font-medium">
              No messages yet. Start the conversation.
            </p>
          </div>
        ) : null}

        {messages.map((message, index) => {
          if (message.type === "system") {
            return (
              <div key={message.id ?? index} className="flex justify-center">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-medium text-gray-400">
                  {message.content}
                </span>
              </div>
            )
          }

          const isMine = message.user_id === user?.id

          return (
            <div
              key={message.id ?? index}
              className={cn(
                "flex items-end gap-2",
                isMine ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 shadow-sm">
                {message.picture ? (
                  <img
                    src={message.picture}
                    alt={message.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-blue-600">
                    {message.username?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "flex max-w-[78%] flex-col gap-1",
                  isMine ? "items-end" : "items-start"
                )}
              >
                <span className="px-1 text-[10px] font-semibold text-gray-400">
                  {isMine ? "You" : message.username}
                </span>

                <div
                  className={cn(
                    "rounded-2xl p-3 text-sm shadow-sm",
                    isMine
                      ? "rounded-tr-none bg-blue-600 text-white"
                      : "rounded-tl-none border border-gray-100 bg-white text-gray-700",
                    message.optimistic ? "opacity-70" : null
                  )}
                >
                  {message.content}
                </div>

                <span className="px-1 text-[9px] text-gray-300">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          )
        })}

        {whoIsTyping.length > 0 ? (
          <div className="flex items-end gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
              <span className="text-[10px] text-gray-400">…</span>
            </div>
            <div className="rounded-2xl rounded-tl-none border border-gray-100 bg-white px-4 py-2 text-xs text-gray-500 shadow-sm">
              <span className="font-semibold">
                {whoIsTyping.map((item) => item.username).join(", ")}
              </span>
              {whoIsTyping.length === 1 ? " is" : " are"} typing...
            </div>
          </div>
        ) : null}
      </CardContent>

      <form
        onSubmit={handleSend}
        className="flex shrink-0 items-center gap-2 border-t bg-white p-3"
      >
        <Input
          type="text"
          placeholder={connected ? "Type a message…" : "Connecting to chat…"}
          value={newMessage}
          onChange={(event) => handleTyping(event.target.value)}
          disabled={!connected}
          className="h-10 rounded-xl border-none bg-gray-50 shadow-inner"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!connected || !newMessage.trim()}
          className="h-10 w-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-200/60 hover:bg-blue-700"
        >
          <Send size={16} />
        </Button>
      </form>
    </Card>
  )
}
