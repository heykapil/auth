import { LoginForm } from "@/components/login-form"
import { Key } from "lucide-react"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted dark:dark bg-gradient-to-r dark:from-neutral-900 dark:to-neutral-600 from-neutral-100 to-neutral-400 p-6 md:p-2">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Key className="size-4" />
          </div>
          kapil.app
        </a>
        <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
