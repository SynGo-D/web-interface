"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  FileText,
  Bell,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    name: "Overview",
    href: "/manager/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/manager/projects",
    icon: FolderKanban,
  },
  {
    name: "Team Performance",
    href: "/manager/team",
    icon: Users,
  },
  {
    name: "Technical Debt",
    href: "/manager/technical-debt",
    icon: BarChart3,
  },
  {
    name: "Project Reports",
    href: "/manager/reports",
    icon: FileText,
  },
  {
    name: "Notifications",
    href: "/manager/notifications",
    icon: Bell,
  },
];

export default function ManagerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-[#4338CA] text-white shadow-xl">

      {/* Logo */}
      <div className="border-b border-white/20 px-6 py-6">
        <h1 className="text-2xl font-bold">
          CodeReview
        </h1>

        <p className="mt-1 text-sm text-white/70">
          Project Manager
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-1.5">

          {menuItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                  active
                    ? "bg-white text-[#4338CA] shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={2}
                  className={active ? "text-[#4338CA]" : "text-white"}
                />

                <span className="text-lg font-medium">
                  {item.name}
                </span>
              </Link>
            );
          })}

        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-white/20 p-4">

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-white transition hover:bg-white/10"
        >
          <LogOut size={20} strokeWidth={2} />

          <span className="text-lg">
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}