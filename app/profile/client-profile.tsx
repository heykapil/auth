"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteUser, linkSocial, signOut } from "@/lib/auth-client";
import { GetInitial } from "@/lib/get-initials";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import {
  AlertTriangle,
  Link as LinkIcon,
  Loader2,
  LogOut,
  Mail,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { ChangeEmail } from "./change-email";
import EditProfile from "./edit-profile";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { ChangePassword } from "./change-password";
import { PasskeyManager } from "./passkey-manager";
import { SendVerificationEmail } from "./send-verification-email";
import SessionsManager from "./sessions-manager";

interface Accounts {
  id: string;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
  accountId: string;
  scopes: string[];
}

export function ClientProfile({
  session,
  user,
  sessions,
  accounts,
}: {
  session: any;
  user: any;
  sessions: any[];
  accounts: Accounts[];
}) {
  const router = useRouter();

  // Check if the user has a password provider
  const hasPasswordProvider = accounts?.some(
    (acc) => acc?.providerId === "credential",
  );

  return (
    <div>
      <div className="w-full rounded-lg m-2 p-4 md:p-6 max-w-2xl space-y-8 mx-auto bg-background">
        {/* USER INFO CARD */}
        <div>
          <div className="text-2xl font-bold text-center mb-6">
            Profile Settings
          </div>
          <div className="space-y-6">
            <div className="flex container justify-between items-center">
              <div className="flex flex-row space-x-4 items-center">
                <div className="flex">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.image as string} alt={user.name} />
                    <AvatarFallback>{GetInitial(user.name)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-base text-muted-foreground">
                    @{user?.username || user.email.split("@")[0]}
                  </p>
                </div>
              </div>
              <div className="flex">
                <EditProfile session={session} user={user} />
              </div>
            </div>

            <div className="flex flex-col space-y-2 border-t border-gray-300 pt-4">
              <p className="text-base">
                Account created:{" "}
                <span className="text-muted-foreground text-pretty">
                  {new Date(user.createdAt).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </p>
              <p className="text-base">
                Current session started:{" "}
                <span className="text-muted-foreground text-pretty">
                  {new Date(session.createdAt).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </p>
              <p className="text-base">
                Account type:{" "}
                <span className="text-muted-foreground">
                  {accounts[0].providerId}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* EMAIL MANAGEMENT */}
        {hasPasswordProvider && <EmailManagement user={user} />}

        {/* SECURITY & ACCOUNT SETTINGS */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold border-b border-gray-300 pb-2">
            Linked accounts
          </h3>

          {/* Account Linking */}
          <AccountLinking accounts={accounts} />
        </div>

        {/* SESSIONS MANAGER */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold border-b border-gray-300 pb-2">
            Sessions & Passkeys
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasskeyManager />
            <SessionsManager session={session} sessions={sessions} />
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="space-y-6  border-destructive/50 pt-6">
          <h3 className="text-xl font-semibold border-b pb-2 border-gray-300 text-destructive">
            Danger Zone
          </h3>
          <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-base">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data.
              </p>
            </div>
            <DeleteAccountModal />
          </div>
          <div className="flex justify-end mt-6">
            <Button
              variant="ghost"
              className="text-red-600 bg-red-100 hover:text-red-700 hover:bg-red-200 hover:font-semibold hover:scale-101 animate-ease-in-out duration-200 cursor-pointer"
              onClick={async () => {
                await signOut();
                toast.success("Logout successful!", {
                  description: "Redirecting to login page...",
                });
                router.push("/login");
              }}
            >
              <LogOut className="w-4 h-4 mr-2 " />
              Log out of this session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// UPDATED: Email Management using new components
// ------------------------------------------------------------------
function EmailManagement({ user }: { user: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold border-b border-gray-300 pb-2">
        Email Address
      </h3>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 shadow-sm rounded-lg">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-muted-foreground mb-1" />
          <span className="text-pretty text-base">{user.email}</span>
          {user.emailVerified ? (
            <div className="text-green-600 flex flex-row items-center text-sm">
              <CheckBadgeIcon className="w-4 h-4 mr-1" />
            </div>
          ) : (
            <div className="text-red-600 flex flex-row items-center text-sm">
              <CheckBadgeIcon className="w-4 h-4 mr-1" />
            </div>
          )}
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          {!user.emailVerified && <SendVerificationEmail user={user} />}
          <div className="flex items-center">
            <ChangeEmail user={user} />
            <ChangePassword />
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// COMPONENT: Account Linking
// ------------------------------------------------------------------
const allProviders = [
  { id: "google", name: "Google" },
  { id: "github", name: "GitHub" },
  { id: "twitter", name: "Twitter" },
];

function AccountLinking({ accounts }: { accounts: Accounts[] }) {
  const [isLinking, setIsLinking] = useState<string | null>(null);

  // Get the list of provider strings (e.g., ['email', 'google'])
  const linkedProviders = accounts.map((acc) => acc.providerId);

  const handleLink = async (provider: string) => {
    setIsLinking(provider);
    try {
      await linkSocial({
        provider: provider as string, // 'google' | 'github' | 'twitter'
        fetchOptions: {
          onError(context) {
            toast.error(`Failed to link ${provider}`, {
              description: context.error.message,
            });
          },
        },
      });
    } catch (error: any) {
      toast.error("An error occurred", { description: error.message });
    } finally {
      setIsLinking(null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-base text-muted-foreground">
        Connect with the social media accounts to sign in to your account.
      </p>
      <div className="space-y-2">
        {allProviders.map((provider) => {
          const isLinked = linkedProviders.includes(provider.id);
          return (
            <div
              key={provider.id}
              className="flex justify-between items-center p-2 shadow-sm rounded-md"
            >
              <span className="font-medium text-base capitalize">
                {provider.name}
              </span>
              {isLinked ? (
                <div className="text-green-600 flex flex-row items-center text-base">
                  <CheckBadgeIcon className="w-5 h-5 mr-1 mb-1" />
                  Linked
                </div>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  className="text-base"
                  onClick={() => handleLink(provider.id)}
                  disabled={isLinking === provider.id}
                >
                  {isLinking === provider.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LinkIcon className="w-3 h-3 mr-1" />
                  )}
                  Link
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// COMPONENT: Delete Account (keeping the original implementation for now)
// ------------------------------------------------------------------
function DeleteAccountModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const confirmationString = "delete my account";

  const handleDelete = async () => {
    if (confirmText !== confirmationString) {
      toast.error("Confirmation text does not match.");
      return;
    }
    setIsLoading(true);
    try {
      await deleteUser({
        fetchOptions: {
          onSuccess() {
            toast.success("Kindly check your email.");
            setIsOpen(false);
            router.push("/"); // Redirect to homepage
          },
          onError(context) {
            toast.error("Failed to delete account", {
              description: context.error.message,
            });
          },
        },
      });
    } catch (error: any) {
      toast.error("An error occurred", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setIsOpen(true)}>
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0  backdrop-blur-md" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-background p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-destructive"
                  >
                    Delete Account
                  </DialogTitle>
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-red-600 bg-destructive/10 p-3 rounded-md flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <span>
                        This action is permanent and cannot be undone. All your
                        data will be erased. We will send you a verification
                        mail before deleting your account for security reasons.
                      </span>
                    </p>
                    <p className="text-base text-muted-foreground">
                      Please type{" "}
                      <strong className="font-bold underline">
                        {confirmationString}
                      </strong>{" "}
                      to confirm.
                    </p>
                    <Input
                      id="confirmDelete"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                    />
                  </div>
                  <div className="mt-6 flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isLoading || confirmText !== confirmationString}
                    >
                      {isLoading && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Delete My Account
                    </Button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
