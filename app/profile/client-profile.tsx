'use client'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authClient, signOut } from "@/lib/auth-client";
import { GetInitial } from "@/lib/get-initials";
import { CheckCircle, CircleX, Key, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import EditProfile from "./edit-profile";
import SessionsManager from "./sessions-manager";
export function ClientProfile({ session, user, sessions }: { session:any, user:any, sessions: any }) {
  const { toast } = useToast();
  const router = useRouter();
    return (
      <div>
          <div className="w-full rounded-lg m-2 p-2 max-w-2xl space-y-6 mx-auto bg-neutral-50">
                <div>
                  <div className="text-2xl font-bold text-center">User Profile</div>
                </div>
                <div className="space-y-6">
                  <div className="flex container justify-between items-center">
                    <div className="flex flex-row space-x-4 items-center">
                  <div className="flex">
                    <Avatar>
                  <AvatarImage src={user.image as string} alt={user.name} />
                  <AvatarFallback>{GetInitial(user.name)}</AvatarFallback>
                        </Avatar>
                  </div>
                    <div>
                      <h2 className="text-xl font-semibold">{user.name}</h2>
                      <p className="text-sm text-muted-foreground">@{user?.username}</p>
                    </div>
                  </div>
                    <div className='flex'>
                      <EditProfile session={session} user={user} />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Email:</span>
                      <span className='text-pretty text-muted-foreground'>{user.email}</span>
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
                    <span>Last login: <span className='text-muted-foreground text-pretty'>{new Date(session.createdAt).toLocaleDateString('en-IN', {month: 'long',day: 'numeric', year: 'numeric'} )}</span></span>
                    {/* <p className="">IPAddress: <span className='text-muted-foreground text-pretty'>{session?.ipAddress}</span></p> */}

                  </div>
                  {/* <ChangePasswordForm /> */}
                </div>
                <div className="flex justify-between">
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
                </div>
                <div>
                </div>
                <SessionsManager session={session} sessions={sessions} />
              </div>
      </div>
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
