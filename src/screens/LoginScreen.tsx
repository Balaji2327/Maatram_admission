"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AtSymbolIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { authApi, getAuthToken } from "../lib/api";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams?.get("registered") === "true";
  const loginRequired = searchParams?.get("loginRequired") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (getAuthToken()) {
      router.replace("/dashboard");
      return;
    }

    setEmail("");
    setPassword("");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login({
        email: email.trim(),
        password: password,
      });

      if (!res.success) {
        setErrorMessage(res.message || "Invalid email or password. Please verify.");
        setIsLoading(false);
        return;
      }

      // Successful login -> Redirect to Student Dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMessage(err.message || "Failed to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[29rem] rounded-xl border border-black/15 bg-white p-6 shadow-sm sm:p-10">
      <header className="mb-7 flex items-center gap-3 border-b border-black/15 pb-5">
          <span aria-hidden="true" className="h-6 w-1.5 rounded-full bg-brand" />
          <Link href="/" className="font-heading text-sm font-bold tracking-wide text-black">Maatram Foundation</Link>
        </header>
      <h1 className="font-heading font-bold text-2xl sm:text-3xl text-black tracking-tight text-left">
        Student Sign In
      </h1>

      {/* Registration Success Banner */}
      {registered && (
        <div className="mt-4 p-3 bg-brand/15 border border-brand/60 rounded-lg flex items-center gap-2.5 text-xs text-black animate-in fade-in duration-300">
          <CheckCircleIcon className="w-5 h-5 text-black shrink-0" />
          <p>
            <span className="font-bold">Account created successfully!</span> Please sign in below with your credentials to access your dashboard.
          </p>
        </div>
      )}

      {/* Login Required Notice */}
      {loginRequired && !registered && (
        <div className="mt-4 p-3 bg-brand/15 border border-brand/60 rounded-lg text-xs text-black text-center font-medium">
          Please sign in to access the student application portal.
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-2.5 bg-brand/15 border border-brand/60 rounded-md text-center text-xs text-black font-medium">
          {errorMessage}
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleLogin} className="mt-6 space-y-4" autoComplete="new-password">
        {/* Email Address */}
        <div>
          <label className="block text-xs font-heading font-bold text-black tracking-wide">
            Registered Email Address
          </label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <AtSymbolIcon className="w-4 h-4 text-black/65" />
            </div>
            <input
              suppressHydrationWarning
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              placeholder="scholar.name@example.com"
              className="w-full bg-black/5 border border-black/15 rounded-md pl-10 pr-4 py-3 text-black placeholder-black/65 text-xs sm:text-sm focus:outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/40 transition font-primary"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-heading font-bold text-black tracking-wide">
            Password
          </label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <LockClosedIcon className="w-4 h-4 text-black/65" />
            </div>
            <input
              suppressHydrationWarning
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••••••"
              className="w-full bg-black/5 border border-black/15 rounded-md pl-10 pr-10 py-3 text-black placeholder-black/65 text-xs sm:text-sm focus:outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/40 transition font-primary"
            />
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-black/65 hover:text-black cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          suppressHydrationWarning
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand hover:brightness-95 text-black font-heading font-bold text-sm sm:text-base py-3.5 px-6 rounded-md flex items-center justify-center gap-2 shadow-sm hover:shadow-sm transition-all duration-200 cursor-pointer mt-5 border border-brand disabled:opacity-70"
        >
          <span>{isLoading ? "Signing in..." : "Sign In"}</span>
          <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* Sign Up & Administrator Links */}
        <div className="text-center pt-3 border-t border-black/15 space-y-2">
          <div>
            <span className="font-primary text-xs text-black">
              New applicant or haven&apos;t registered yet?{" "}
            </span>
            <Link
              href="/signup"
              className="font-primary text-xs font-bold text-black hover:text-brand hover:underline transition"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function LoginScreen() {
  return (
    <main className="min-h-screen grid place-items-center bg-black/5 text-black px-4 py-10 sm:py-16 font-primary selection:bg-brand">

      <Suspense
        fallback={
          <div className="w-full max-w-lg bg-white border border-black/15 rounded-xl p-10 shadow-sm text-center text-black text-sm">
            Loading sign in...
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </main>
  );
}
