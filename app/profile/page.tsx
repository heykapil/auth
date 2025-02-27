'use client'
import { Spinner } from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient, signOut, useSession } from "@/lib/auth-client";
import { CheckCircle, CircleX, Key, LogOut } from "lucide-react";
import { Suspense } from "react";
import { toast } from "sonner";
export  default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user
  if(!user?.id) {
        return <Suspense fallback={<Spinner />}>
          <div className="flex mt-16 w-full mx-auto justify-center p-2 max-w-sm flex-col gap-6">
                  <h2 className="animate-fade-right text-2xl font-semibold">
                    Not Authorized!
                  </h2>
                  <p className="animate-fade-up">No session to view the profile!</p>
                  <p className="mt-10">
                    Kindly{' '}
                    <a
                      className="font-medium underline underline-offset-2"
                      href={`/login?callbackURL=/profile`}
                    >
                      login
                    </a>{' '}
                    with your account to access the profile!
                  </p>
                </div>
        </Suspense>
  }
    return (
      <Suspense fallback={<Spinner />}>
      <div>
          <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user?.name || user?.email}`}
                      alt={user.name}
                      width={100}
                      height={100}
                      className="rounded-full"
                    />
                    <div>
                      <h2 className="text-xl font-semibold">{user.name}</h2>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Email:</span>
                      <span className='text-pretty'>{user.email}</span>
                      {user.emailVerified ? (
                        <Badge variant="secondary" className="ml-2">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ): (
                        <Badge variant="destructive" className="ml-2">
                          <CircleX className="w-3 h-3 mr-1" />
                          Not verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* <ChangePasswordForm /> */}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="default"  onClick={async() => await addPasskey()}>
                    <Key className="w-4 h-4 mr-2" />
                    Add passkeys
                  </Button>
                  {/* <Button variant="default"  onClick={async() => await listPasskey()}>
                    <Key className="w-4 h-4 mr-2" />
                    List passkeys
                  </Button> */}
                  <Button variant="destructive" onClick={async() => await signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    SignOut
                  </Button>
                </CardFooter>
              </Card>
      </div>
      </Suspense>
    )
}


const addPasskey = async () => {

  try {
     await authClient.passkey.addPasskey({
       fetchOptions: {
         onSuccess() {
           toast.success(`Passkey added successfully!`);
         },
         onError(context) {
           toast.error(context.error?.message);
         }
       }
     })
  } catch(error) {
    console.log(error)
    throw new Error( 'An error occurred while adding passkey!')
  }
}

const listPasskey = async() => {
  try {
     await authClient.passkey.listUserPasskeys()
  } catch(error) {
    console.log(error)
    throw new Error( 'An error occurred while listing passkeys')
  }
}
