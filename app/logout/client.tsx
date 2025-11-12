"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
export default function ClientLogoutPage() {
  const searchParams = useSearchParams();
  const callbackURL = searchParams?.get("callbackURL") || "/login";
  const router = useRouter();
  useEffect(() => {
    async function LogOut() {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push(callbackURL); // redirect to login page or callbackURL
          },
        },
      });
    }
    LogOut();
  }, []);
  return <></>;
}
