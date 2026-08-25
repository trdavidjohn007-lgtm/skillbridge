"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleSSOLogin = () => {
    // SSO redirect — production implementation would redirect to government IdP
    // For now, show a notice that SSO is coming soon
    setError("SSO login is coming soon. Please use email/password.");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
            <Target className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-white">
            Skill Intelligence Platform
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/80">
            AI-enabled competency assessment and personalized learning for
            India's Official Statistical System
          </p>
          <div className="mt-8 space-y-4 text-left">
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <span className="text-sm">🎯</span>
              </div>
              <span>AI-based competency assessment</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <span className="text-sm">📊</span>
              </div>
              <span>Automated skill-gap analysis</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <span className="text-sm">📚</span>
              </div>
              <span>Personalized iGOT Karmayogi recommendations</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <span className="text-sm">🤖</span>
              </div>
              <span>AI-powered quiz generation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full items-center justify-center bg-white px-4 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Skill Intelligence
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
          <p className="mt-2 text-gray-500">
            Access your competency dashboard and learning paths
          </p>

          {/* SSO Button */}
          <button
            onClick={handleSSOLogin}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
              />
            </svg>
            Sign in with Government SSO
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="you@gov.in"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <a
              href="#"
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Contact your administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
