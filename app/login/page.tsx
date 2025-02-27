import { LoginForm } from "@/components/login-form"
import { Suspense } from "react"

export default function LoginPage() {
  return (
      <div className="flex min-h-svh lg:mt-16 flex-col items-center justify-center gap-6 absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:14px_24px] p-2 md:p-6 dark:bg-black dark:bg-[linear-gradient(to_right,#7f7f7f0a_1px,transparent_1px),linear-gradient(to_bottom,#7f7f7f0a_1px,transparent_1px)]">
        <div className="flex w-full max-w-sm flex-col gap-6">
          {/* <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md">
            <Fingerprint className="size-4" />
          </div>
          Authenticate
        </a> */}
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
  )}
