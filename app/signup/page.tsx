import { SignUpForm } from "@/components/signup-form";
import { Suspense } from "react";
export default function SignUpPage() {
  return (
        <Suspense>
        <SignUpForm />
        </Suspense>
  )
}
