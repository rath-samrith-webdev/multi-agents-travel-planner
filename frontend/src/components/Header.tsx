import {
  Compass,
  LayoutDashboard,
  Map as MapIcon,
  Moon,
  Palette,
  Sun,
  User as UserIcon,
  X,
} from "lucide-react"
import { useState } from "react"
import { Link, NavLink } from "react-router-dom"

import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const navItems = [
  { name: "Generate", path: "/", icon: Compass },
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
]

const colorSchemes = [
  { id: "purple", name: "Purple" },
  { id: "blue", name: "Blue" },
  { id: "orange", name: "Orange" },
  { id: "green", name: "Green" },
]

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme()
  const [showSettings, setShowSettings] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light")
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            to={isAuthenticated ? "/" : "/login"}
            className="group flex items-center gap-2"
          >
            <div className="rounded-xl bg-primary p-2 shadow-lg shadow-primary/20 transition-transform group-hover:rotate-6">
              <MapIcon className="text-white" size={20} />
            </div>
            <span className="text-xl font-black uppercase italic tracking-tighter">
              Trip<span className="text-primary">Agent</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all",
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm shadow-primary/10"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )
                    }
                  >
                    <item.icon size={18} />
                    <span className="hidden sm:inline">{item.name}</span>
                  </NavLink>
                ))}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-full"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="rounded-full"
                >
                  <Palette className="h-5 w-5" />
                </Button>

                <Link to="/dashboard">
                  <button className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-muted transition-all hover:border-primary/30 hover:bg-primary/10">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon size={18} className="text-muted-foreground" />
                    )}
                  </button>
                </Link>

                <Button variant="ghost" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-full"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="rounded-full"
                >
                  <Palette className="h-5 w-5" />
                </Button>

                <Link to="/login">
                  <Button>Login</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm border-none shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">Appearance</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                  className="rounded-full"
                >
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <Button
                      key={t}
                      variant={theme === t ? "default" : "outline"}
                      onClick={() => setTheme(t)}
                      className="capitalize"
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Color Scheme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {colorSchemes.map((scheme) => (
                    <Badge
                      key={scheme.id}
                      variant={colorScheme === scheme.id ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2 text-center transition-all hover:scale-105"
                      onClick={() => setColorScheme(scheme.id as any)}
                    >
                      {scheme.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
