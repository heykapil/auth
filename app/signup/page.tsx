import { SignUpForm } from "@/components/signup-form";
import { Suspense } from "react";
export default function SignUpPage() {
  return (
    <div className="flex flex-col mt-16 items-center justify-center gap-6 absolute inset-0 -z-10 h-full w-full bg-neutral-100 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] p-2 md:p-6 dark:bg-neutral-900 dark:bg-[linear-gradient(to_right,#7f7f7f0a_1px,transparent_1px),linear-gradient(to_bottom,#7f7f7f0a_1px,transparent_1px)]">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md">
            <Fingerprint className="size-4" />
          </div>
          Authenticate
        </a> */}
        <Suspense>
        <SignUpForm />
        </Suspense>
      </div>
    </div>
  )
}
