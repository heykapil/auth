import { auth } from "@/lib/auth";
import { betterFetch } from "@better-fetch/fetch";
import { headers } from "next/headers";
import { Suspense } from "react";
import { ClientProfile } from "./client-profile";
export default async function ProfilePage() {
  type Session = typeof auth.$Infer.Session;
  const { data: session } = await betterFetch<Session>("/api/auth/get-session",{
    baseURL: process.env.BETTER_AUTH_URL,
    headers: await headers()
  });
  if(!session) {
    return <div className="flex mt-16 w-full mx-auto justify-center p-2 max-w-sm flex-col gap-6">
            <h2 className="animate-fade-right text-2xl font-semibold">
              Not Authorized!
            </h2>
            <p className="animate-fade-up">No session to view the profile!</p>
            <p className="mt-10">
              Kindly{' '}
              <a
                className="font-medium underline underline-offset-2"
                href={`/login?callbackURL=/profile`}
              >
                login
              </a>{' '}
              with your account to access the profile!
            </p>
          </div>
  }
  return <Suspense><ClientProfile session={session?.session} user={session?.user} /></Suspense>
}
