"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "▦",
    },
    {
      name: "Repositories",
      href: "/repository",
      icon: "◈",
    },
    {
      name: "Code Review",
      href: "/dashboard/code-review",
      icon: "✓",
    },
    {
      name: "Debt Calculation",
      href: "/dashboard/debt",
      icon: "▥",
    },
    {
      name: "AI Code Fixing",
      href: "/dashboard/ai-fixing",
      icon: "⚙",
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-[#4338CA] text-white shadow-lg">

      {/* Logo */}
      <div className="shrink-0 border-b border-white/10 px-6 py-6">
        <h1 className="text-2xl font-bold">
          CodeReview
        </h1>

        <p className="mt-1 text-md text-indigo-200">
          Developer Dashboard
        </p>
      </div>


      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">

        <div className="space-y-2">

          {menuItems.map((item) => {

            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition ${
                  isActive
                    ? "bg-white text-[#4338CA]"
                    : "text-white hover:bg-white/10"
                }`}
              >

                <span className="w-6 text-center text-lg">
                  {item.icon}
                </span>

                <span>
                  {item.name}
                </span>

              </Link>
            );

          })}

        </div>

      </nav>


      {/* Logout */}
      <div className="shrink-0 border-t border-white/10 p-4">

        <button
          type="button"
          onClick={() => console.log("Logout")}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <span className="text-lg">
            ⇥
          </span>

          Logout
        </button>

      </div>

    </aside>
  );
}