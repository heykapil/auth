import { SignUpForm } from "@/components/signup-form";
import { ActivityIcon } from "lucide-react";
export default function SignUpPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-r dark:from-neutral-900 dark:to-neutral-600 from-neutral-100 to-neutral-400 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ActivityIcon className="size-4" />
          </div>
          kapil.app
        </a>
        <SignUpForm />
      </div>
    </div>
  )
}
