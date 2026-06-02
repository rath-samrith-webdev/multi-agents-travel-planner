import type { ReactNode } from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Header from "@/components/Header.tsx"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import Dashboard from "@/pages/Dashboard.tsx"
import Home from "@/pages/Home.tsx"
import Itinerary from "@/pages/Itinerary.tsx"
import JoinTrip from "@/pages/JoinTrip.tsx"
import Login from "@/pages/Login.tsx"

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "YOUR_GOOGLE_CLIENT_ID_HERE"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground selection:bg-blue-600/10 selection:text-blue-600">
            <Header />
            <main className="animate-in fade-in duration-700">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/join/:inviteToken" element={<JoinTrip />} />
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/itinerary" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              </Routes>
            </main>
            <footer className="mt-20 border-t py-12">
              <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
                © 2026 Multi-Agent AI Travel Planner
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App
