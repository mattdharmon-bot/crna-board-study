"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

interface NavItem {
  label: string;
  href: string;
  roles: Role[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", roles: ["ADMIN", "STUDENT"] },
  { label: "Take Quiz", href: "/quiz", roles: ["STUDENT"] },
  { label: "Review Missed", href: "/review", roles: ["STUDENT"] },
  { label: "Analytics", href: "/analytics", roles: ["STUDENT"] },
  { label: "Topics", href: "/admin/topics", roles: ["ADMIN"] },
  { label: "Questions", href: "/admin/questions", roles: ["ADMIN"] },
];

interface SidebarProps {
  role: Role;
  userName?: string | null;
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

  const visible = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">CRNA Study</h1>
        <p className="text-xs text-gray-400 mt-1 truncate">{userName ?? "Student"}</p>
        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
          {role}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visible.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
