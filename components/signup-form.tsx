'use client'
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { generateUserID } from "@/lib/userid";
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from "next/dist/client/components/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "./spinner";
export function SignUpForm() {
  const schema = z.object({
      name: z.string().min(3, {message: 'Name must be at least 3 characters'}),
      email: z.string().min(1, {message: 'Email is required'}).email('Invalid email address'),
      password: z.string().min(8, {message: 'Password must be at least 8 characters'}),
      repassword: z.string().min(8, {message: 'Password must be at least 8 characters'})
    }).superRefine((val, ctx) => {
        if (val.password !== val.repassword) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password is not same as confirm password',
            path: ['repassword'],
          })
        }
      })
  type ValidationSchemaType = z.infer<typeof schema>
  const form = useForm<ValidationSchemaType>({
    resolver: zodResolver(schema)
  })
  const [isLoading, setIsLoading] = useState(false)
  const username = generateUserID();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') || '/profile'
  async function onSubmit(values: any) {
    setIsLoading(true)
    const { data, error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      username: username,
      image: `https://ui-avatars.com/api/?name=${values.name}`
    })
    if (!data || error) {
      toast.error("Something went wrong", {
        description: error?.message || "An error occurred. Please try again."
      })
    } else {
        toast.success("Account created successfully",{
          description: "Kindly check your email for verification. Check spam folder as well!"
        })
    }
  setIsLoading(false)
  }
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-amber-50/2 rounded-lg p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl text-gray-900">New user?</h1>
          <span className="text-slate-500">Fill up the form to create a new account!</span>
        </div>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <div className="flex flex-row space-x-2">
                        <FormDescription className="flex">
                          This is your public display name.
                        </FormDescription>
                        <FormMessage className="flex" />
                        </div>
                      </FormItem>
                    )}
                  />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
            <FormItem>
            <FormLabel>Email</FormLabel>
             <FormControl>
            <Input
              id="email"
              type="email"
              // placeholder="hello@email.com"
              {...field}
            />
             </FormControl>
             <div className="flex flex-row space-x-2">
             <FormDescription className="flex">
               A verification code will be sent to this email.
             </FormDescription>
              <FormMessage className="flex" />
             </div>
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
              <FormItem>
              <FormLabel>
                Password
              </FormLabel>
            <FormControl>
            <Input
              id="password"
              type='password'
              className="w-full"
              {...field}
            />
              </FormControl>
              <div className="flex flex-row space-x-2">
              <FormDescription className="flex">
                Enter a strong password. Use at least 8 characters.
              </FormDescription>
              <FormMessage className="flex" />
              </div>
              </FormItem>
              )}
              />
              <FormField
                control={form.control}
                name="repassword"
                render={({ field }) => (
                <FormItem>
                <FormLabel>
                  Confirm Password
                </FormLabel>
              <FormControl>
              <Input
                id="repassword"
                type='text'
                className="w-full"
                {...field}
              />
                </FormControl>
                <div className="flex flex-row space-x-2">
                <FormDescription className="flex">
                  Enter your password again.
                </FormDescription>
                <FormMessage className="flex" />
                </div>
                </FormItem>
                )}
                />
                <div className="pt-2" />
            <Button type="submit" className="flex flex-row w-full justify-center items-center h-12 bg-indigo-500 text-white hover:scale-101 transition-all duration-200 easy-in-out" disabled={isLoading}>
              {isLoading ? (<span className="flex flex-row justify-center items-center w-full">Creating... <Spinner className="w-4 h-4 absolute ml-2" /></span>) : `Continue`}
            </Button>
              </form>
            </Form>
            <div className="items-center py-2 text-center">
            <span className="text-base z-10  px-2 text-muted-foreground">
                Already have an account?{" "}
            <a href={`/login?redirectTo=${redirectTo}`} className="underline text-indigo-500 hover:font-semibold underline-offset-4">
                  Login
                </a>
              </span>
              {/*<div className="text-balance mt-4 text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                By clicking continue, you agree to our <a href="https://kapil.app/terms">Terms of Service</a>{" "}
                and <a href="https://kapil.app/privacy">Privacy Policy</a>.
              </div>*/}
            </div>
    </div>
    </div>
  )
}
