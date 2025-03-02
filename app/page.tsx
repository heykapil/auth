import { Session } from "@/lib/auth"
import { betterFetch } from "@better-fetch/fetch"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function Home({
  params,searchParams
}: {
 params: Promise <{params:string}>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const search = await searchParams;
  const redirectTo = search['redirectTo'] || '/profile';
  const {data:session , error} = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: process.env.BETTER_AUTH_URL,
    headers: await headers(),
  })
  if (error && error?.status>0 || !session) {
    redirect(`/login?redirectTo=${redirectTo}`)
  }
  else {
    redirect(decodeURI(redirectTo as string))
  }

  return <div>Redirecting...</div>
}
