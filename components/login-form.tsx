'use client'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent, CardDescription,
    CardHeader, CardTitle
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { signIn } from "@/lib/auth-client"
import { loginSchemaCredentials, loginSchemaMagicLink } from "@/lib/schema/login"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { AtSign, EyeClosed, EyeIcon, Fingerprint, Github, UsersRoundIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Spinner } from "./spinner"
import { Input } from "./ui/input"
export function LoginForm() {
    const searchParams = useSearchParams();
    const callbackURL = searchParams?.get("callbackURL") || '/profile';
    const [isLoading, setisLoading] = useState<boolean>(false)
    const [isLoadingGithub, setisLoadingGithub] = useState<boolean>(false)
    const [isLoadingTwitter, setisLoadingTwitter] = useState<boolean>(false)
    const [isLoadingGoogle, setisLoadingGoogle] = useState<boolean>(false)
    const [isPasskeyLoading, setisPasskeyLoading] = useState<boolean>(false)
    const { toast } = useToast();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [magicLink, setmagicLink] = useState<boolean>(false);
    const schema = magicLink ? loginSchemaMagicLink : loginSchemaCredentials;
    const form = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema)
      }
    )
    async function signInPasskey() {
        setisPasskeyLoading(true)
      await signIn.passkey({
        fetchOptions: {
                  onRequest(){
                    setisPasskeyLoading(true)
                  },
                  onResponse(){
                    setisPasskeyLoading(false)
                  },
									onSuccess() {
									 toast({
                      description: "Login successful!",
                      variant: "success",
                      title: "Welcome back!"
                    });
										router.push(callbackURL);
                    router.refresh();
									},
									onError(context) {
                    toast({
                      description: context.error.message,
                      variant: "destructive",
                      title: "Something went wrong!"
                    });
									},
								},
      })
          .then(()=> setisPasskeyLoading(false))
          .catch((err)=> {
            setisPasskeyLoading(false)
            toast({
              description: err.message,
              variant: "destructive",
              title: "Something went wrong!"
            })
          })
          .finally(
            () => {
              router.push(callbackURL);
              router.refresh()
            })
    }
  async function onSubmit(values: any) {
    if (magicLink) {
      setisLoading(true)
      await signIn.magicLink({ email: values.email, callbackURL: callbackURL },{
        onRequest: () => {
          setisLoading(true)
        },
        onResponse: () => {
          setisLoading(false)
        },
        onError: (ctx) => {
          toast({
            description: ctx.error?.message,
            variant: 'destructive',
            title: 'Something went wrong!'
          })
        },
        onSuccess: () => {
          toast({
            description: `Magic link sent to ${values?.email}!`,
            variant: "success",
            title: "Magic link sent!"
          })
        }
      })
    } else {
      await signIn.email({ email: values.email, password: values.password, callbackURL: callbackURL },{
      onRequest: () => {
        setisLoading(true)
      },
      onResponse: () => {
				setisLoading(false);
				},
			onError: (ctx) => {
          toast({
            description: ctx.error?.message,
            variant: 'destructive',
            title: 'Something went wrong!'
          })
        },
        onSuccess: () => {
          toast({
            description: `Welcome back!`,
            variant: "success",
            title: "Login Successful!"
          })
        }
      })
      .then(()=> setisLoading(false))
    }
  }
  return (
    <>
    <Card className="w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>
          Sign into your account using your social account, email, or registered passkey!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn("flex flex-col gap-0")}>
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-0">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <a className="bg-secondary font-mono text-secondary-foreground shadow-sm hover:bg-secondary/80 px-4 py-2 justify-center flex flex-row rounded-lg mx-auto items-center place-items-center w-full text-center">Social accounts
                  <UsersRoundIcon className="w-4 h-4 mx-2" />
                  </a>
              </AccordionTrigger>
              <AccordionContent className='mx-2'>
                <div className="grid gap-6">
                  <div className="flex flex-col gap-4">
                      <Button variant="outline" onClick={async () => {
                        setisLoadingGithub(true)
                        await signIn.social({
                          provider: 'github',
                          callbackURL: callbackURL
                        })
                        setisLoadingGithub(false)
                      }
                      } className="w-full">
                        {isLoadingGithub ? <Spinner className="w-4 h-4 aboslute" /> : (<span className="flex flex-row justify-center items-center"><Github className="w-4 h-4 mr-2" />
                          Login with Github
                        </span>)}
                    </Button>
                      <Button variant="outline" className="w-full" onClick={async () => {
                        setisLoadingTwitter(true)
                        await signIn.social({
                          provider: 'twitter',
                          callbackURL: callbackURL
                        })
                        setisLoadingTwitter(false)
                      }}>
                        {isLoadingTwitter ? <Spinner className="w-4 h-4 aboslute" /> : (
                        <span className="flex flex-row justify-center items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" viewBox="0 0 50 50">
                        <path fill="currentColor" d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z"></path>
                        </svg>
                      Login with Twitter
                      </span>)}
                    </Button>
                      <Button variant="outline" onClick={async () => {
                        setisLoadingGoogle(true)
                        await signIn.social({
                        provider: 'google',
                        callbackURL: callbackURL
                      })
                        setisLoadingGoogle(false)
                      }
                    } className="w-full">
                      {isLoadingGoogle ? <Spinner className="w-4 h-4 aboslute" /> : (
                        <span className="flex flex-row justify-center items-center">
                      <svg className='mr-2' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Login with Google
                      </span>)}
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger><a className='bg-secondary font-mono text-secondary-foreground shadow-sm hover:bg-secondary/80 px-4 py-2 justify-center flex flex-row rounded-lg mx-auto items-center place-items-center w-full text-center'>Login using email <AtSign className="w-4 h-4 ml-2" /></a> </AccordionTrigger>
              <AccordionContent className='mx-2'>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <FormMessage />
                      </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      // @ts-ignore
                      name="password"
                      render={({ field }) => (
                      <FormItem>
                      <FormLabel>
                        <div className="flex flex-row justify-between">
                        Password
                        <a
                          onClick={() => setmagicLink(!magicLink)}
                          className="ml-auto text-sm p-0 m-0 hover:bg-none underline-offset-4 hover:underline"
                        >
                          {magicLink === true ? 'I know my password!' : 'Forgot my password?'}
                        </a>
                        </div>
                      </FormLabel>
                    <FormControl>
                      <div className="flex flex-row items-center relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'}
                    className="w-full"
                    // placeholder="Enter password here.."
                      disabled={magicLink}
                      // hasError={!!fieldState.error}
                      {...field}
                    />
                    <a className="absolute right-3 top-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {!showPassword ? <EyeIcon className="w-4 h-4" /> : <EyeClosed className="w-4 h-4" />}
                    </a>
                    </div>
                      </FormControl>
                    <FormMessage />
                    </FormItem>
                    )}
                      />
                  <Button type="submit" className="w-full">
                    {isLoading ? (<Spinner className='absolute' /> ) :   (magicLink ? 'Send Magic Link' : 'Login')}
                  </Button>
                </form>
                </Form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <Button variant='secondary' className='flex flex-row mx-auto w-full font-mono text-sm font-medium items-center mt-1.5'  onClick={async ()=>await signInPasskey()}>
          {isPasskeyLoading ? (<Spinner className="w-4 h-4 absolute" />): (<span className="flex flex-row mx-auto">Login using passkey
            <Fingerprint className="w-4 h-4 ml-2" /></span>)}</Button>
        <div className="flex flex-col gap-4 mt-6">
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Create an account?{" "}
                <a href="/signup" className="underline hover:text-blue-500 underline-offset-4">
                  Sign up
                </a>
              </span>
            </div>
          </div>
    </CardContent>
    </Card>
    <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
      By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
      and <a href="#">Privacy Policy</a>.
    </div>
    </>
  )
    }
