"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  FiHome,
  FiFolder,
  FiGithub,
  FiGitPullRequest,
  FiSearch,
  FiBarChart2,
  FiCpu,
  FiLogOut,
} from "react-icons/fi";

const menuItems = [
  {
    name: "Dashboard",
    href: "/developer/dashboard",
    icon: FiHome,
  },
  {
    name: "Projects",
    href: "/developer/projects",
    icon: FiFolder,
  },
  {
    name: "Repositories",
    href: "/developer/repositories",
    icon: FiGithub,
  },
  {
    name: "Pull Requests",
    href: "/developer/pull-requests",
    icon: FiGitPullRequest,
  },
  {
    name: "Code Review",
    href: "/developer/code-review",
    icon: FiSearch,
  },
  {
    name: "Debt Calculation",
    href: "/developer/debt-calculation",
    icon: FiBarChart2,
  },
  {
    name: "AI Code Fixing",
    href: "/developer/ai-code-fixing",
    icon: FiCpu,
  },
];

const bottomItems = [
  {
    name: "Logout",
    href: "/",
    icon: FiLogOut,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-72 flex-col bg-[#4338CA] text-white shadow-xl">

      <div className="border-b border-indigo-500 px-6 py-6">
        <h1 className="text-2xl font-bold">
          Code Review
        </h1>

        <p className="mt-1 text-sm text-indigo-200">
          Developer Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-3 text-xs uppercase tracking-wider text-indigo-200">
          Main Menu
        </p>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                  active
                    ? "bg-white text-[#4338CA] shadow-md"
                    : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
                }`}
              >
                <Icon size={20} />

                <span className="font-medium">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-indigo-500 p-4">

        <div className="space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                  active
                    ? "bg-white text-[#4338CA]"
                    : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
                }`}
              >
                <Icon size={20} />

                <span className="font-medium">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

      </div>

    </aside>
  );
}