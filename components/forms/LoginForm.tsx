"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { saveSession } from "@/lib/session";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Registers/looks up the matching backend user so downstream calls
    // (repository connect, integrations list) have a real userId to work
    // with, then routes to the role's landing page.
    const signInAs = async (
        matchedEmail: string,
        fullName: string,
        redirectTo: string
    ) => {
        try {
            setSubmitting(true);
            const { token, user } = await login(matchedEmail, fullName);
            saveSession(token, { userId: user.id, email: user.email, fullName: user.fullName });
            router.push(redirectTo);
        } catch (error) {
            console.error(error);
            alert("Unable to sign in right now. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Administrator
  if (
    email === "admin@codereview.com" &&
    password === "admin123"
    ) {
        signInAs(email, "Admin User", "/admin/dashboard");
        return;
    }

    // Senior Developer
    if (
        email === "developer@codereview.com" &&
        password === "developer123"
    ) {
        signInAs(email, "Developer User", "/repository");
        return;
    }

    // Project Manager
    if (
        email === "manager@codereview.com" &&
        password === "manager123"
    ) {
        signInAs(email, "Manager User", "/manager/dashboard");
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
            disabled={submitting}
            className="w-full rounded-lg bg-[#4338CA] py-3 font-semibold text-white transition hover:opacity-90"
        >
            Sign In
        </button>
        </form>
    );
}