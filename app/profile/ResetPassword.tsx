"use client";

import { Button } from "@/components/ui/button";
import { Session } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ResetPasswordProps {
  user: NonNullable<Session["user"]>;
}

export function ResetPassword({ user }: ResetPasswordProps) {
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async () => {
    setLoading(true);
    const { data, error } = await authClient.requestPasswordReset({
      email: user.email,
      redirectTo: "/reset-password",
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Something went wrong.");
      return;
    }

    if (data) {
      toast.success("Password reset email sent.", {
        description: "Check your email for a link to reset your password.",
      });
    }
  };

  return (
    <Button
      variant="link"
      size="sm"
      className="text-base"
      onClick={handleRequestReset}
      disabled={loading}
    >
      <Mail className="w-3 h-3 mr-1 mb-1" />
      Reset password
    </Button>
  );
}
