"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import {
  loginSchemaCredentials,
  loginSchemaMagicLink,
} from "@/lib/schema/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Github, KeyIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "./spinner";

// Helper components for social icons to keep the main component cleaner
const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="0.98em"
    height="1em"
    viewBox="0 0 256 262"
  >
    <path
      fill="#4285f4"
      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
    ></path>
    <path
      fill="#34a853"
      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
    ></path>
    <path
      fill="#fbbc05"
      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
    ></path>
    <path
      fill="#eb4335"
      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
    ></path>
  </svg>
);

const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    className="w-20 h-20"
    viewBox="0 0 50 50"
  >
    <path d="M 6.9199219 6 L 21.136719 26.726562 L 6.2285156 44 L 9.40625 44 L 22.544922 28.777344 L 32.986328 44 L 43 44 L 28.123047 22.3125 L 42.203125 6 L 39.027344 6 L 26.716797 20.261719 L 16.933594 6 L 6.9199219 6 z"></path>
  </svg>
);

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") || "/profile";
  const callbackURL = `/?redirectTo=` + encodeURIComponent(redirectTo);
  const router = useRouter();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [step, setStep] = useState<"email" | "password">("email");
  const [loginMethod, setLoginMethod] = useState<"password" | "magic">(
    "password",
  );

  const form = useForm<z.infer<typeof loginSchemaCredentials>>({
    resolver: zodResolver(loginSchemaCredentials),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleSocialLogin(provider: "github" | "google" | "twitter") {
    setLoading((prev) => ({ ...prev, [provider]: true }));
    try {
      await signIn.social({ provider, callbackURL });
      const bc = new BroadcastChannel("better-auth-session");
      bc.postMessage("refresh");
      bc.close();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!", {
        description: "Could not sign in with " + provider,
      });
    } finally {
      setLoading((prev) => ({ ...prev, [provider]: false }));
    }
  }

  async function signInPasskey() {
    setLoading((prev) => ({ ...prev, passkey: true }));
    await signIn
      .passkey({
        fetchOptions: {
          onSuccess() {
            const bc = new BroadcastChannel("better-auth-session");
            bc.postMessage("refresh");
            bc.close();
            toast.success("Welcome back!", {
              description: "Login successful!",
            });
            router.push(callbackURL);
          },
          onError(context) {
            toast.error("Something went wrong!", {
              description: context.error.message,
            });
          },
        },
      })
      .finally(() => setLoading((prev) => ({ ...prev, passkey: false })));
  }

  async function handleEmailSubmit() {
    const email = form.getValues("email");
    const validation = loginSchemaMagicLink.safeParse({ email });

    if (!validation.success) {
      form.setError("email", {
        type: "manual",
        message: validation.error.issues[0].message,
      });
      return;
    }
    form.clearErrors("email");
    setStep("password");
  }

  async function onSubmitPassword(
    values: z.infer<typeof loginSchemaCredentials>,
  ) {
    setLoading((prev) => ({ ...prev, credentials: true }));
    await signIn
      .email(
        {
          email: values.email,
          password: values.password,
          callbackURL: callbackURL,
        },
        {
          onError: (ctx) => {
            toast.error("Something went wrong!", {
              description: ctx.error?.message,
            });
          },
          onSuccess: () => {
            toast.success("Login Successful!", {
              description: `Welcome back!`,
            });
            const bc = new BroadcastChannel("better-auth-session");
            bc.postMessage("refresh");
            bc.close();
            router.push(callbackURL);
          },
        },
      )
      .finally(() => setLoading((prev) => ({ ...prev, credentials: false })));
  }

  async function handleMagicLinkSubmit() {
    const email = form.getValues("email");
    const validation = loginSchemaMagicLink.safeParse({ email });

    if (!validation.success) {
      form.setError("email", {
        type: "manual",
        message: validation.error.issues[0].message,
      });
      return;
    }
    form.clearErrors("email");

    setLoading((prev) => ({ ...prev, magic: true }));
    await signIn
      .magicLink(
        { email, callbackURL },
        {
          onError: (ctx) => {
            toast.error("Something went wrong!", {
              description: ctx.error?.message,
            });
          },
          onSuccess: () => {
            toast.success("Magic link sent!", {
              description: `Magic link sent to ${email}!`,
            });
            const bc = new BroadcastChannel("better-auth-session");
            bc.postMessage("refresh");
            bc.close();
          },
        },
      )
      .finally(() => setLoading((prev) => ({ ...prev, magic: false })));
  }

  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full max-w-md rounded-lg p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl text-gray-900">Welcome Back!</h1>
          <span className="font-cooper text-slate-500">
            Sign in to your account to continue your journey.
            <br />
            Use social account or a saved passkey.
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 md:flex items-center space-x-1">
          <div>
            <Button
              id="sign-in-with-google"
              aria-label='sign-in-with-google"'
              disabled={isAnyLoading}
              variant="ghost"
              className=" w-full cursor-pointer border-gray-200 border hover:scale-105 transition-all duration-200 easy-in-out"
              onClick={() => handleSocialLogin("google")}
            >
              {loading["google"] ? <Spinner /> : <GoogleIcon />}
              Google
            </Button>
          </div>
          <div>
            <Button
              disabled={isAnyLoading}
              variant="ghost"
              id="sign-in-with-github"
              aria-label="sign-in-with-github"
              className="border cursor-pointer w-full  border-gray-200 hover:scale-105 transition-all duration-200 easy-in-out"
              onClick={() => handleSocialLogin("github")}
            >
              {loading["github"] ? <Spinner /> : <Github />} Github
            </Button>
          </div>
          <div>
            <Button
              disabled={isAnyLoading}
              variant={"ghost"}
              id="sign-in-with-twitter"
              aria-label="sign-in-with-twitter"
              className="border w-full cursor-pointer border-gray-200 hover:scale-105 transition-all duration-200 easy-in-out"
              onClick={() => handleSocialLogin("twitter")}
            >
              {loading["twitter"] ? <Spinner /> : <TwitterIcon />} Twitter
            </Button>
          </div>
          <div>
            <Button
              variant="ghost"
              id="sign-in-with-passkey"
              aria-label="sign-in-with-passkey"
              className="border  cursor-pointer w-full border-gray-200 hover:scale-105 transition-all duration-200 easy-in-out"
              onClick={signInPasskey}
              disabled={isAnyLoading}
            >
              {loading["passkey"] ? <Spinner /> : <KeyIcon />} Passkey
              <span className="sr-only">Saved passkey</span>
            </Button>
          </div>
        </div>
        {step === "password" ? (
          <div className="flex items-center justify-between py-1">
            <p className="text-base text-gray-700">
              Hi,{" "}
              <span className="font-semibold">{form.getValues("email")}</span>
            </p>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setLoginMethod("password");
                form.setValue("password", "");
              }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Edit email
            </button>
          </div>
        ) : (
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-600 font-mono uppercase">
              Or sign in with email
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={
              step === "email"
                ? (e) => {
                    e.preventDefault();
                    handleEmailSubmit();
                  }
                : loginMethod === "magic"
                  ? (e) => {
                      e.preventDefault();
                      handleMagicLinkSubmit();
                    }
                  : form.handleSubmit(onSubmitPassword)
            }
            className="space-y-4"
          >
            {/* Step 1: Email field */}
            {step === "email" && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-gray-700">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className="h-12"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Step 2: Password field (replaces email field position) */}
            {step === "password" && loginMethod === "password" && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base text-gray-700">
                        Password
                      </FormLabel>
                      <button
                        type="button"
                        onClick={() => setLoginMethod("magic")}
                        className="text-base font-semibold text-blue-600 hover:text-blue-500"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="h-12 pr-10"
                          autoFocus
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Step 2: Magic link message (replaces email field position) */}
            {step === "password" && loginMethod === "magic" && (
              <div className="space-y-4">
                <div className="text-base text-gray-600 py-1 text-center">
                  We&apos;ll email you a magic link for a password-free sign in.
                </div>
                <button
                  type="button"
                  onClick={() => setLoginMethod("password")}
                  className="text-base font-semibold text-blue-600 hover:text-blue-500 w-full text-center"
                >
                  Sign in with password instead
                </button>
              </div>
            )}

            {/* Button - stays in same position across all states */}
            <Button
              type="submit"
              className="w-full h-12 text-base bg-blue-600 text-white font-medium hover:scale-101 transition-all duration-200 easy-in-out"
              disabled={
                step === "email"
                  ? isAnyLoading
                  : loginMethod === "password"
                    ? loading["credentials"]
                    : loading["magic"]
              }
            >
              {step === "email" ? (
                "Continue"
              ) : loginMethod === "password" ? (
                loading["credentials"] ? (
                  <Spinner />
                ) : (
                  "Sign In"
                )
              ) : loading["magic"] ? (
                <Spinner />
              ) : (
                "Send Magic Link"
              )}
            </Button>
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
            <a
              href={`/signup?redirectTo=${redirectTo}`}
              className="font-semibold text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline"
            >
              Sign up
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
