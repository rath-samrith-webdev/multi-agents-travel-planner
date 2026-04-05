import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Map as MapIcon, User, Compass, LayoutDashboard } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Header() {
  const navItems = [
    { name: 'Generate', path: '/', icon: Compass },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
            <MapIcon className="text-white" size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">
            Trip<span className="text-blue-600">Agent</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 md:gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )
              }
            >
              <item.icon size={18} />
              <span className="hidden sm:inline">{item.name}</span>
            </NavLink>
          ))}

          <div className="h-8 w-[1px] bg-gray-100 mx-2 hidden sm:block"></div>

          <button className="h-10 w-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 hover:border-gray-200 transition-all group">
            <User size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </button>
        </nav>
      </div>
    </header>
  );
}
