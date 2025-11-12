import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/actions";
import { Suspense } from "react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const search = await searchParams;
  const redirectTo = search["redirectTo"];
  const session = await getSession();
  if (session) {
    return (
      <div className="flex flex-col space-y-2 gap-2 mt-10">
        <span className="flex">Hello, {session?.user?.name}! </span>
        <span className="flex space-x-1 gap-1">
          You are already logged in with email
          <u>{session?.user?.email}.</u>
        </span>
        <a href={redirectTo !== undefined ? redirectTo : "/profile"}>
          Return back to{" "}
          <u>{redirectTo !== undefined ? redirectTo : "Profile"}</u>
        </a>
        <a href="/logout?redirectTo=/login" className="font-serif">
          Logout →
        </a>
      </div>
    );
  }
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
