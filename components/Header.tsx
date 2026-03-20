"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Logo } from "@/components/Logo";

export function Header() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Logo size={28} />
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            UriCode
          </h1>
        </Link>

        {/* Right side navigation and profile */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-3 pr-4 border-r border-slate-200">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                dashboard
              </span>
              Dashboard
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  admin_panel_settings
                </span>
                Admin
              </Link>
            )}
          </nav>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">
                person
              </span>
            </div>
            <span className="text-sm font-medium text-slate-700">
              {user?.displayName}
            </span>
            <button
              onClick={signOut}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
