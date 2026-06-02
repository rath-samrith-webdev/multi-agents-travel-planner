/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react"
import { jwtDecode } from "jwt-decode"

import type { User } from "@/types/travel"

interface DecodedToken {
  exp?: number
}

interface AuthContextValue {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (newToken: string, userData: User) => void
  logout: () => void
}

const TOKEN_KEY = "token"
const USER_KEY = "user"

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function isTokenExpired(token: string) {
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    return Boolean(decoded.exp && decoded.exp * 1000 < Date.now())
  } catch {
    return true
  }
}

function readStoredUser(): User | null {
  try {
    const rawUser = localStorage.getItem(USER_KEY)
    return rawUser ? (JSON.parse(rawUser) as User) : null
  } catch {
    return null
  }
}

function readStoredAuth() {
  const storedToken = localStorage.getItem(TOKEN_KEY)

  if (!storedToken || isTokenExpired(storedToken)) {
    clearStoredAuth()
    return { token: null, user: null as User | null }
  }

  return {
    token: storedToken,
    user: readStoredUser(),
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [{ token, user }, setAuthState] = useState(readStoredAuth)

  const login = useCallback((newToken: string, userData: User) => {
    if (isTokenExpired(newToken)) {
      clearStoredAuth()
      setAuthState({ token: null, user: null })
      return
    }

    setAuthState({ token: newToken, user: userData })
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setAuthState({ token: null, user: null })
    clearStoredAuth()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [login, logout, token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}
