"use client";

import { Button } from "@/components/ui/button";
import { sendVerificationEmail } from "@/lib/auth-client";
import { Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "./modal";

interface SendVerificationEmailProps {
  user: {
    email: string;
    [key: string]: any;
  };
}

export function SendVerificationEmail({ user }: SendVerificationEmailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendVerification = async () => {
    setIsLoading(true);
    try {
      await sendVerificationEmail({
        email: user.email,
        fetchOptions: {
          onSuccess() {
            toast.success("Verification email sent!", {
              description: "Please check your inbox.",
            });
            setIsOpen(false);
          },
          onError(context) {
            toast.error("Failed to send email", {
              description: context.error.message,
            });
          },
        },
      });
    } catch (error: unknown) {
      toast.error("An error occurred", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-3 h-3 mr-1" />
        )}
        Resend Verification
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Resend Verification Email"
      >
        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Current Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            We&apos;ll send a verification link to your email address. Click the
            link in the email to verify your account.
          </p>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendVerification}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Verification Email
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
