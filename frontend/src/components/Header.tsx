import { Compass, LayoutDashboard, Map as MapIcon, User as UserIcon } from "lucide-react"
import { Link, NavLink } from "react-router-dom"

import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Generate", path: "/", icon: Compass },
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
]

export default function Header() {
  const { isAuthenticated, user } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to={isAuthenticated ? "/" : "/login"} className="group flex items-center gap-2">
          <div className="rounded-xl bg-blue-600 p-2 shadow-lg shadow-blue-500/20 transition-transform group-hover:rotate-6">
            <MapIcon className="text-white" size={20} />
          </div>
          <span className="text-xl font-black uppercase italic tracking-tighter">
            Trip<span className="text-blue-600">Agent</span>
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
                      "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all",
                      isActive
                        ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <item.icon size={18} />
                  <span className="hidden sm:inline">{item.name}</span>
                </NavLink>
              ))}

              <Link to="/dashboard">
                <button className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-muted transition-all hover:border-blue-200 hover:bg-blue-50">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.username} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon size={18} className="text-muted-foreground" />
                  )}
                </button>
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}