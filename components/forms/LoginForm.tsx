"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Administrator
  if (
    email === "admin@codereview.com" &&
    password === "admin123"
    ) {
        router.push("/admin/dashboard");
        return;
    }

    // Senior Developer
    if (
        email === "developer@codereview.com" &&
        password === "developer123"
    ) {
        router.push("/repository");
        return;
    }

    // Project Manager
    if (
        email === "manager@codereview.com" &&
        password === "manager123"
    ) {
        router.push("/manager/dashboard");
        return;
    }

    alert("Invalid email or password.");
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
            <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
            >
            Email
            </label>

            <input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#4338CA] text-black caret-[#4338CA]"
            required
            />
        </div>

        {/* Password */}
        <div>
            <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
            >
                Password
            </label>

            <input
                id="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#4338CA] text-black caret-[#4338CA]"
                required
            />
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
            <button
            type="button"
            className="text-sm font-medium text-[#4338CA] hover:underline"
            >
            Forgot Password?
            </button>
        </div>

        {/* Submit Button */}
        <button
            type="submit"
            className="w-full rounded-lg bg-[#4338CA] py-3 font-semibold text-white transition hover:opacity-90"
        >
            Sign In
        </button>
        </form>
    );
}