"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, login } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { clearWorkspace } from "@/lib/workspace";

/**
 * Signing in with an organization email and password. The password is
 * checked against a stored hash by integration-service; what the person
 * then sees is decided by the organizations they belong to.
 */
export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setSubmitting(true);
        setError(null);

        try {
            const { token, user } = await login(email.trim().toLowerCase(), password);

            // Whoever was signed in before may have been working in another
            // organization; their project must not follow this person in.
            clearWorkspace();
            saveSession(token, { userId: user.id, email: user.email, fullName: user.fullName });

            router.push("/select-project");
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Couldn't sign you in. Check your connection and try again."
            );
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                </label>

                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@yourcompany.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#4338CA] text-black caret-[#4338CA]"
                    autoFocus
                    required
                />
            </div>

            <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                </label>

                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#4338CA] text-black caret-[#4338CA]"
                    required
                />
            </div>

            {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#4338CA] py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
                {submitting ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-gray-600">
                New here, or added to an organization by your admin?{" "}
                <Link href="/signup" className="font-medium text-[#4338CA] hover:underline">
                    Create your account
                </Link>
            </p>
        </form>
    );
}
