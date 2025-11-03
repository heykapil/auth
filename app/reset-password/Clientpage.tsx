"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const errorQuery = searchParams.get("error");

  useEffect(() => {
    if (errorQuery === "invalid_token") {
      toast.error("Invalid or expired password reset token.", {
        description: "Please request a new password reset link.",
      });
      // Optionally redirect user away after showing the toast
      // router.push('/forgot-password');
    }
  }, [errorQuery, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error("Password reset token is not available.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    const { data, error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    setLoading(false);

    if (!data) {
      toast.error("Failed to reset password. Please try again.");
    } else if (error) {
      toast.success("Your password has been reset successfully!");
      router.push("/login");
    }
  };

  if (!token && !errorQuery) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Missing Token</h2>
        <p className="text-muted-foreground">
          The password reset token is missing from the URL.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm p-8 space-y-4 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-gray-500">Enter your new password below.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            required
            minLength={8}
            disabled={loading || !!errorQuery}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !token || !!errorQuery}
          className="w-full px-4 py-2 text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
