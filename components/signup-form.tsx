'use client'
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { generateUserID } from "@/lib/userid";
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Spinner } from "./spinner";
import { Input } from "./ui/input";
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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false)
  const username = generateUserID()
  async function onSubmit(values: any) {
    setIsLoading(true)
    const { data, error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      username: username,
      image: `https://ui-avatars.com/api/?name=${values.name}`
    })
    console.log({
      values,
      data,
      error
    })
    if (!data || error) {
      toast({
        description: error?.message || "An error occurred. Please try again.",
        title: "Something went wrong",
        variant: "destructive"
      })
    } else {
        toast({
          description: "Kindly check your email for verification. Check spam folder as well!",
          title: "Account created successfully",
          variant: "success"
        })
    }
  setIsLoading(false)
  }
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
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
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
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
             <FormDescription>
               A verification code will be sent to this email.
             </FormDescription>
              <FormMessage />
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
              <FormDescription>
                Enter a strong password. Use at least 8 characters.
              </FormDescription>
              <FormMessage />
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
                <FormDescription>
                  Enter your password again.
                </FormDescription>
                <FormMessage />
                </FormItem>
                )}
                />
            <Button type="submit" className="mt-2 flex flex-row w-full justify-center items-center" disabled={isLoading}>
              {isLoading ? (<span className="flex flex-row justify-center items-center w-full">Creating <Spinner className="w-4 h-4 absolute ml-2" /></span>) : `Create an account!`}
            </Button>
              </form>
            </Form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
