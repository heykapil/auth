import { CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login Link Sent",
};

export default function MagicLinkSent() {
  return (
    <Suspense>
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="min-w-md max-w-md bg-background">
        <div className="px-4">
          <div className="flex flex-col items-center space-y-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <CardTitle className="text-center text-2xl font-bold">
              Login Link Sent!
            </CardTitle>
          </div>
          <div className="space-y-4 text-center">
            <p className="w-96 text-sm text-muted-foreground">
              We have sent a magic link to your email address, click the continue
              button in the email to login. If you do not see the email in your
              inbox, check your spam folder.
            </p>
            <p className="text-sm text-muted-foreground">
              Still did not receive the email?{" "}
              <Link
                href="/login"
                className="cursor-pointer font-medium underline-offset-4 hover:underline"
              >
                Try Again
              </Link>
            </p>
          </div>
          </div>
        </div>
    </main>
    </Suspense>
  );
}
