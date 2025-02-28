'use client'
import { Spinner } from "@/components/spinner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authClient, Session, signOut } from "@/lib/auth-client";
import { CheckCircle, CircleX, Key, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
export function ClientProfile({session, user}: Session) {
  const { toast } = useToast();
  function GetInitial(name: string){
    const initials = name?.match(/(\b\S)?/g)?.join("")?.match(/(^\S|\S$)?/g)?.join("")?.toUpperCase()
    return initials;
  }
  const router = useRouter()
    return (
      <Suspense fallback={<Spinner />}>
      <div>
          <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                  <AvatarImage src={user.image as string} alt={user.name} />
                  <AvatarFallback>{GetInitial(user.name)}</AvatarFallback>
                        </Avatar>
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
                  <Button variant="default"  onClick={async() => await AddPasskey(toast)}>
                    <Key className="w-4 h-4 mr-2" />
                    Add passkeys
                  </Button>
                  {/* <Button variant="default"  onClick={async() => await listPasskey()}>
                    <Key className="w-4 h-4 mr-2" />
                    List passkeys
                  </Button> */}
              <Button variant="destructive" onClick={async () => {
                await signOut();
                toast({
                  title: 'Logout successful!',
                  description: 'Redirecting to login page...',
                  variant: 'success'
                });
                router.push('/login');
              }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    SignOut
                  </Button>
                </CardFooter>
              </Card>
      </div>
      </Suspense>
    )
}


const AddPasskey = async (toast: any) => {
  try {
    await authClient.passkey.addPasskey({
      fetchOptions: {
        onSuccess() {
          toast({title:`Passkey added successfully!`, variant: `success`});
         },
         onError(context) {
           toast({ description: context.error?.message, variant: 'destructive' });
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
