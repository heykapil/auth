'use client'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { signIn } from "@/lib/auth-client"
import { loginSchemaCredentials, loginSchemaMagicLink } from "@/lib/schema/login"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Github, KeyIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Spinner } from "./spinner"


// Helper components for social icons to keep the main component cleaner
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
  <path d="M 6.9199219 6 L 21.136719 26.726562 L 6.2285156 44 L 9.40625 44 L 22.544922 28.777344 L 32.986328 44 L 43 44 L 28.123047 22.3125 L 42.203125 6 L 39.027344 6 L 26.716797 20.261719 L 16.933594 6 L 6.9199219 6 z"></path>
  </svg>
);


export function LoginForm() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams?.get("redirectTo") || '/profile';
    const callbackURL = `/?redirectTo=` + encodeURIComponent(redirectTo);
    const router = useRouter();
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loginMethod, setLoginMethod] = useState<'password' | 'magic'>('password');

    const form = useForm<z.infer<typeof loginSchemaCredentials>>({
        resolver: zodResolver(loginSchemaCredentials),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    async function handleSocialLogin(provider: 'github' | 'google' | 'twitter') {
        setLoading(prev => ({ ...prev, [provider]: true }));
        try {
            await signIn.social({ provider, callbackURL });
            const bc = new BroadcastChannel('better-auth-session')
            bc.postMessage('refresh')
            bc.close()
        } catch (error) {
            console.error(error);
          toast.error("Something went wrong!", {
            description: "Could not sign in with " + provider
          });
        } finally {
            setLoading(prev => ({ ...prev, [provider]: false }));
        }
    }

    async function signInPasskey() {
        setLoading(prev => ({ ...prev, 'passkey': true }))
        await signIn.passkey({
            fetchOptions: {
                onSuccess() {
                    const bc = new BroadcastChannel('better-auth-session');
                    bc.postMessage('refresh');
                    bc.close();
                    toast.success("Welcome back!", {description: "Login successful!"});
                    router.push(callbackURL);
                },
                onError(context) {
                    toast.error("Something went wrong!", {
                        description: context.error.message,
                    });
                },
            }
        }).finally(() => setLoading(prev => ({ ...prev, 'passkey': false })));
    }

    async function onSubmitPassword(values: z.infer<typeof loginSchemaCredentials>) {
        setLoading(prev => ({ ...prev, 'credentials': true }));
        await signIn.email({ email: values.email, password: values.password, callbackURL: callbackURL }, {
            onError: (ctx) => {
                toast.error('Something went wrong!', {
                    description: ctx.error?.message,
                })
            },
            onSuccess: () => {
              toast.success("Login Successful!", {
                    description: `Welcome back!`,
                })
              const bc = new BroadcastChannel('better-auth-session');
              bc.postMessage('refresh');
              bc.close();
                router.push(callbackURL);
            }
        }).finally(() => setLoading(prev => ({ ...prev, 'credentials': false })));
    }

    async function handleMagicLinkSubmit() {
        const email = form.getValues('email');
        const validation = loginSchemaMagicLink.safeParse({ email });

        if (!validation.success) {
            form.setError("email", { type: "manual", message: validation.error.issues[0].message });
            return;
        }
        form.clearErrors("email");

        setLoading(prev => ({ ...prev, 'magic': true }));
        await signIn.magicLink({ email, callbackURL }, {
            onError: (ctx) => {
                toast.error('Something went wrong!', {
                    description: ctx.error?.message,
                });
            },
            onSuccess: () => {
                toast.success("Magic link sent!", {
                    description: `Magic link sent to ${email}!`,
                });
                const bc = new BroadcastChannel('better-auth-session');
                bc.postMessage('refresh');
                bc.close();
            }
        }).finally(() => setLoading(prev => ({ ...prev, 'magic': false })));
    }

    const isAnyLoading = Object.values(loading).some(Boolean);

    return (
        <div className="flex flex-col justify-center items-center">
          <div className="w-full max-w-md rounded-lg p-4 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl text-gray-900">Welcome Back!</h1>
              <span className="text-slate-500">Sign in to your account to continue your journey.<br/>Use social account or a saved passkey.</span>
            </div>
                  <div className="flex items-center justify-center space-x-4">
                    <Button disabled={isAnyLoading} variant="secondary" className="w-10 h-10 hover:scale-105 transition-all duration-200 easy-in-out" onClick={() => handleSocialLogin('google')}>
                        {loading['google'] ? <Spinner /> : <GoogleIcon />}
                    </Button>
                    <Button disabled={isAnyLoading} variant="secondary" className="w-10 h-10 hover:scale-105 transition-all duration-200 easy-in-out" onClick={() => handleSocialLogin('github')}>
                        {loading['github'] ? <Spinner /> : <Github  />}
                    </Button>
                    <Button disabled={isAnyLoading} variant="secondary" className="w-10 h-10 hover:scale-105 transition-all duration-200 easy-in-out" onClick={() => handleSocialLogin('twitter')}>
                        {loading['twitter'] ? <Spinner /> : <TwitterIcon />}
                    </Button>
                    <Button variant="secondary" className="w-10 h-10 hover:scale-105 transition-all duration-200 easy-in-out" onClick={signInPasskey} disabled={isAnyLoading}>
                      {loading['passkey'] ? <Spinner /> : <KeyIcon />}
                      <span className="sr-only">Saved passkey</span>
                    </Button>
                  </div>
                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase">Or sign in with email</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base text-gray-700">Email Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            {...field}
                                            className="h-12"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {loginMethod === 'password' && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center">
                                                <FormLabel className="text-base text-gray-700">Password</FormLabel>
                                                <button type="button" onClick={() => setLoginMethod('magic')} className=" text-base font-semibold text-indigo-600 hover:text-indigo-500">
                                                    Forgot password?
                                                </button>
                                            </div>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        {...field}
                                                        className="h-12 pr-10"
                                                    />
                                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-12 text-base bg-indigo-500 text-white hover:scale-101 transition-all duration-200 easy-in-out" disabled={loading['credentials']}>
                                    {loading['credentials'] ? <Spinner /> : 'Sign In'}
                                </Button>
                            </div>
                        )}

                        {loginMethod === 'magic' && (
                             <div className="space-y-6">
                                <div className="text-base text-center text-gray-600 mt-10">
                                     We&apos;ll email you a magic link for a password-free sign in. <button type="button" onClick={() => setLoginMethod('password')} className="font-semibold text-indigo-600 hover:text-indigo-500">Sign in with password instead.</button>
                                </div>
                                <Button type="button" onClick={handleMagicLinkSubmit} className="w-full h-12 bg-indigo-500 text-white hover:scale-101 transition-all duration-200 easy-in-out" disabled={loading['magic']}>
                                    {loading['magic'] ? <Spinner /> : 'Send Magic Link'}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>

                {/*<div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase">Otherwise</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>*/}


                <div className="text-center pt-6">
                <span className=" text-slate-500">
                    Don&apos;t have an account?{" "}
                    <a href={`/signup?redirectTo=${redirectTo}`} className="font-semibold text-indigo-600 hover:text-indigo-500 underline-offset-4 hover:underline">
                        Sign up
                    </a>
                </span>
                </div>
            </div>
        </div>
    )
}
