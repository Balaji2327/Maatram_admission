"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  DevicePhoneMobileIcon,
  AtSymbolIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { authApi } from "../lib/api";

export default function SignUpScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter your full name");
      return;
    }
    if (!formData.mobileNumber.trim()) {
      setErrorMessage("Please enter your mobile number");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email address");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Password and confirm password do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (!res.success) {
        setErrorMessage(res.message || "Failed to create account. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Successful registration: Redirect to Student Login screen with email prefilled
      router.push(`/login?registered=true&email=${encodeURIComponent(formData.email.trim())}`);
    } catch (err: any) {
      console.error("SignUp error:", err);
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="portal-entry min-h-screen w-full bg-white text-black flex items-center justify-center p-4 sm:p-6 lg:p-8 font-primary selection:bg-brand selection:text-black relative overflow-hidden">
      {/* Soft warm ambient blur in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Expanded Centered White Card */}
      <div className="w-full max-w-lg bg-white border border-black/15 rounded-xl p-6 sm:p-8 md:p-10 shadow-sm relative z-10 transition-all duration-300">
        
        {/* Brand Logo */}
        <div className="flex justify-center mb-4">
          <Link href="/" className="group transition-transform cursor-pointer focus:outline-none">
            <Image
              src="/assets/images/logo.png"
              alt="Maatram Foundation"
              width={160}
              height={80}
              priority
              className="h-14 w-auto object-contain transition-opacity group-hover:opacity-90"
            />
          </Link>
        </div>

        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-black tracking-tight text-center">
          Student Registration
        </h1>
        <p className="font-primary text-xs sm:text-sm text-black leading-relaxed mt-1.5 text-center">
          Create your student account to apply for higher education support.
        </p>

        {errorMessage && (
          <div className="mt-4 p-3 bg-brand/15 border border-brand/60 rounded-md text-xs text-black font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSignUp} className="mt-5 space-y-4" autoComplete="off">
          {/* Field 1: Full Name */}
          <div>
            <label className="block text-xs font-heading font-bold text-black tracking-wide">
              Student Full Name
            </label>
            <div className="relative mt-1.5">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <UserIcon className="w-4 h-4 text-black/65" />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="e.g., Ananya Raman"
                className="w-full bg-black/5 border border-black/15 rounded-md pl-10 pr-4 py-3 text-black placeholder-black/65 text-xs sm:text-sm focus:outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/40 transition font-primary"
              />
            </div>
          </div>

          {/* Field 2: Mobile Number */}
          <div>
            <label className="block text-xs font-heading font-bold text-black tracking-wide">
              Mobile Number
            </label>
            <div className="relative mt-1.5">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <DevicePhoneMobileIcon className="w-4 h-4 text-black/65" />
              </div>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                placeholder="+91 98765 43210"
                className="w-full bg-black/5 border border-black/15 rounded-md pl-10 pr-4 py-3 text-black placeholder-black/65 text-xs sm:text-sm focus:outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/40 transition font-primary"
              />
            </div>
          </div>

          {/* Field 3: Email Address */}
          <div>
            <label className="block text-xs font-heading font-bold text-black tracking-wide">
              Email Address
            </label>
            <div className="relative mt-1.5">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <AtSymbolIcon className="w-4 h-4 text-black/65" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="scholar.name@example.com"
                className="w-full bg-black/5 border border-black/15 rounded-md pl-10 pr-4 py-3 text-black placeholder-black/65 text-xs sm:text-sm focus:outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/40 transition font-primary"
              />
            </div>
          </div>

          {/* Field 4: Password */}
          <div>
            <label className="block text-xs font-heading font-bold text-black tracking-wide">
              Create Password
            </label>
            <div className="relative mt-1.5">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <LockClosedIcon className="w-4 h-4 text-black/65" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full bg-black/5 border border-black/15 rounded-md pl-10 pr-10 py-3 text-black placeholder-black/65 text-xs sm:text-sm focus:outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/40 transition font-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-black/65 hover:text-black cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Field 5: Confirm Password */}
          <div>
            <label className="block text-xs font-heading font-bold text-black tracking-wide">
              Confirm Password
            </label>
            <div className="relative mt-1.5">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <LockClosedIcon className="w-4 h-4 text-black/65" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Re-enter password"
                className="w-full bg-black/5 border border-black/15 rounded-md pl-10 pr-10 py-3 text-black placeholder-black/65 text-xs sm:text-sm focus:outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/40 transition font-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-black/65 hover:text-black cursor-pointer"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand hover:brightness-95 text-black font-heading font-bold text-sm sm:text-base py-3.5 px-6 rounded-md flex items-center justify-center gap-2 shadow-sm hover:shadow-sm transition-all duration-200 cursor-pointer mt-5 border border-brand disabled:opacity-70"
          >
            <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
            <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>

          {/* Sign In Link */}
          <div className="text-center pt-3 border-t border-black/15">
            <span className="font-primary text-xs text-black">
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className="font-primary text-xs font-bold text-black hover:text-brand hover:underline transition"
            >
              Sign In
            </Link>
          </div>
        </form>

      </div>
    </main>
  );
}
