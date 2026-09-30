"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: "▦",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: "◉",
    },
    {
      name: "Projects",
      href: "/admin/projects",
      icon: "▣",
    },
    {
      name: "Repositories",
      href: "/admin/repositories",
      icon: "◈",
    },
    {
      name: "Analysis",
      href: "/admin/analysis",
      icon: "✓",
    },
    {
      name: "Technical Debt",
      href: "/admin/debt",
      icon: "▥",
    },
    {
      name: "System Logs",
      href: "/admin/logs",
      icon: "☷",
    },
    {
      name: "System Monitoring",
      href: "/admin/monitoring",
      icon: "◉",
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-[#4338CA] text-white shadow-lg">

      <div className="shrink-0 border-b border-white/10 px-6 py-6">
        <h1 className="text-3xl font-bold">
          CodeReview
        </h1>

        <p className="mt-1 text-md text-indigo-200">
          Administrator Panel
        </p>
      </div>

      <div className="space-y-2">

        {menuItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition ${
                active
                  ? "bg-white text-[#4338CA]"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <span className="w-6 text-center text-lg">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </Link>
          );
        })}

      </div>

      <div className="shrink-0 border-t border-white/20 p-4">

        <button
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium hover:bg-white/10"
          onClick={() => console.log("Logout")}
        >
          <span>⇥</span>
          Logout
        </button>

      </div>

    </aside>
  );
}