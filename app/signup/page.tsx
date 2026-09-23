"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, register } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { clearWorkspace } from "@/lib/workspace";

const MIN_PASSWORD_LENGTH = 8;

/**
 * Creating an account.
 *
 * This is also how someone an admin added to an organization by email sets
 * their password for the first time: registering with that same address
 * claims the account that was made for them, so the role they were given
 * still applies.
 */
export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmation) {
      setError("Those two passwords don't match.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Please choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { token, user } = await register(email.trim().toLowerCase(), fullName.trim(), password);

      clearWorkspace();
      saveSession(token, { userId: user.id, email: user.email, fullName: user.fullName });

      router.push("/select-project");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't create your account. Check your connection and try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#4338CA] p-8">
      <div className="flex flex-col items-center">
        <div className="mb-6 flex items-center gap-2">
          <Image src="/assets/icons/logo.png" width={32} height={32} alt="CodeLens Logo" />
          <h1 className="text-4xl font-semibold text-white">CodeLens</h1>
        </div>

        <div className="w-112.5 max-w-full rounded-xl bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-1 text-gray-500">
            Use your organization email. If an admin has already added you, this sets your password and keeps the
            access you were given.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="fullName"
                autoComplete="name"
                placeholder="Amara Perera"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black caret-[#4338CA] outline-none transition focus:border-[#4338CA]"
                autoFocus
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Organization email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@yourcompany.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black caret-[#4338CA] outline-none transition focus:border-[#4338CA]"
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
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black caret-[#4338CA] outline-none transition focus:border-[#4338CA]"
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
              <p className="mt-1 text-xs text-gray-500">At least {MIN_PASSWORD_LENGTH} characters.</p>
            </div>

            <div>
              <label htmlFor="confirmation" className="mb-2 block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="confirmation"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black caret-[#4338CA] outline-none transition focus:border-[#4338CA]"
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
              {submitting ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/" className="font-medium text-[#4338CA] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
