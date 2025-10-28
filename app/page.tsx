import { Session } from "@/lib/auth";
import { betterFetch } from "@better-fetch/fetch";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home({
   searchParams
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const search = await searchParams;
  const redirectTo = search['redirectTo'] || '/profile';
  const {data:session , error} = await betterFetch<Session>("/api/auth/get-session",{
    baseURL: process.env.BETTER_AUTH_URL,
    headers: await headers()
  });
  if(!session || !!error){
    redirect(`/login?redirectTo=${redirectTo}`)
  } else {
    redirect(redirectTo)
  }
  return <div>Redirecting...</div>
}
