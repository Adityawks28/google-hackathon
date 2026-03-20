"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";

export function Header() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/10 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-primary text-2xl">
            terminal
          </span>
          <h1 className="text-2xl font-bold tracking-tighter text-primary font-headline">
            Google Hackathon
          </h1>
        </Link>

        {/* Right side navigation and profile */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-8 pr-6 border-r border-outline-variant/10">
            <Link
              href="/analytics"
              className="flex items-center gap-2 text-sm font-medium font-headline tracking-tight text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              <span className="material-symbols-outlined text-lg">
                analytics
              </span>
              Analytics
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium font-headline tracking-tight text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              <span className="material-symbols-outlined text-lg">
                dashboard
              </span>
              Dashboard
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm font-medium font-headline tracking-tight text-on-surface-variant hover:text-primary transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-lg">
                  admin_panel_settings
                </span>
                Admin
              </Link>
            )}
          </nav>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/20 shadow-sm">
              <span className="material-symbols-outlined text-primary text-base">
                person
              </span>
            </div>
            <span className="text-sm font-medium font-headline text-on-surface-variant">
              {user?.displayName}
            </span>
            <button
              onClick={signOut}
              className="text-sm font-medium text-outline hover:text-primary transition-colors duration-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
