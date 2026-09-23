"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { getWorkspace, noWorkspace, subscribeToWorkspace } from "@/lib/workspace";

import {
  FiHome,
  FiGithub,
  FiGitPullRequest,
  FiUsers,
  FiBarChart2,
  FiCpu,
  FiLogOut,
} from "react-icons/fi";

/*
Every entry links to a page that exists. The rest of the planned product
is listed too, but greyed out and unclickable: a menu that leads to 404s
reads as a broken app, while "not built yet" is honest and still shows
where the product is going.
*/
const menuItems = [
  {
    name: "Dashboard",
    href: "/developer/dashboard",
    icon: FiHome,
  },
  {
    name: "Repositories",
    href: "/repository",
    icon: FiGithub,
  },
  {
    name: "Pull Requests",
    href: "/developer/pull-requests",
    icon: FiGitPullRequest,
  },
  {
    name: "Contributors",
    href: "/developer/contributors",
    icon: FiUsers,
  },
];

const comingSoon = [
  { name: "Debt Calculation", icon: FiBarChart2 },
  { name: "AI Code Fixing", icon: FiCpu },
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

  // Which project the user is working in. Read from browser storage, so
  // it is null while rendering on the server.
  const workspace = useSyncExternalStore(subscribeToWorkspace, getWorkspace, noWorkspace);

  return (
    <aside className="flex h-screen w-72 flex-col bg-[#4338CA] text-white shadow-xl">

      <div className="border-b border-indigo-500 px-6 py-6">
        <h1 className="text-2xl font-bold">
          Code Review
        </h1>

        {workspace ? (
          <div className="mt-1">
            <p className="truncate text-sm font-medium text-white" title={workspace.projectName}>
              {workspace.projectName}
            </p>
            <p className="truncate text-xs text-indigo-200" title={workspace.organizationName}>
              {workspace.organizationName} · {workspace.role.toLowerCase()}
            </p>
            <Link href="/select-project" className="mt-1 inline-block text-xs text-indigo-200 underline">
              Switch project
            </Link>
          </div>
        ) : (
          <Link href="/select-project" className="mt-1 inline-block text-sm text-indigo-200 underline">
            Choose a project
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-3 text-xs uppercase tracking-wider text-indigo-200">
          Main Menu
        </p>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active = pathname.startsWith(item.href);

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

        <p className="mb-3 mt-8 px-3 text-xs uppercase tracking-wider text-indigo-300">
          Coming soon
        </p>

        <div className="space-y-2">
          {comingSoon.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.name}
                aria-disabled="true"
                title="Not built yet"
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-indigo-300/60"
              >
                <Icon size={20} />

                <span className="font-medium">
                  {item.name}
                </span>
              </div>
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