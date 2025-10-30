"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeEmail } from "@/lib/auth-client";
import { Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "./modal";

interface ChangeEmailProps {
  user: {
    email: string;
    [key: string]: any;
  };
}

export function ChangeEmail({ user }: ChangeEmailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const router = useRouter();

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await changeEmail({
        newEmail: newEmail,
        fetchOptions: {
          onSuccess() {
            toast.success("Email change requested!", {
              description: "Please check your new email's inbox to verify.",
            });
            setIsOpen(false);
            setNewEmail("");
            // Refresh the page to show the unverified email
            router.refresh();
          },
          onError(context) {
            toast.error("Failed to change email", {
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
        variant="link"
        size="sm"
        className="text-base"
        onClick={() => setIsOpen(true)}
      >
        <Mail className="w-3 h-3 mr-1 mb-1" />
        Change email
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Change Email Address"
      >
        <form onSubmit={handleChangeEmail} className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            A verification link will be sent to your new email address. Your
            email will not be updated until you verify it.
          </p>
          <div>
            <Label htmlFor="currentEmail">Current Email</Label>
            <Input
              id="currentEmail"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="newEmail">New Email</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter your new email address"
              required
            />
          </div>
          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Request Change
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
