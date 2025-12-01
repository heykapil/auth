"use client";

import { authClient, signOut, useSession } from "@/lib/auth-client";
import { GetInitial } from "@/lib/get-initials";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Bars2Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  image: z.string().url("Invalid image URL").or(z.literal("")),
});

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function Header() {
  const { data: session } = useSession();
  const status =
    session === undefined
      ? "loading"
      : session?.user
        ? "authenticated"
        : "unauthenticated";

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") || "/profile";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      username: "",
      image: "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      form.reset({
        name: session.user.name || "",
        username: session.user.username || "",
        image: session.user.image || "",
      });
    }
  }, [session, form]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully!");
      window.location.href = `/login?redirectTo=${encodeURIComponent(
        redirectTo,
      )}`;
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
    }
  };

  const handleAddPasskey = async () => {
    // const toastId = toast.loading('Waiting for passkey prompt...')
    try {
      await authClient.passkey.addPasskey({
        fetchOptions: {
          onSuccess() {
            toast.success(`Passkey added successfully!`);
          },
          onError(context) {
            toast.error("Something went wrong", {
              description: context.error?.message,
            });
          },
        },
      });
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        toast.error("Not allowed!");
      } else {
        toast.error(error.message || "Failed to add passkey.");
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-gray-200/80 backdrop-blur-lg `}
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-3">
        <div className="flex gap-3 items-center">
          <img
            src="https://cdn.kapil.app/logo.svg"
            alt="Logo"
            className="h-10 w-auto cursor-pointer"
            onClick={() => router.push("/")}
          />
          <h3 className="animate-fade-left text-lg">auth.kapil.app</h3>
        </div>
        {/* --- DESKTOP MENU --- */}
        <div className="hidden lg:flex items-center gap-x-8">
          {status === "loading" && (
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          )}

          {status === "authenticated" && session?.user && (
            <PopoverGroup>
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <PopoverButton className="flex items-center gap-x-1 outline-none">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={session.user.image!}
                          alt={session.user.name!}
                        />
                        <AvatarFallback>
                          {GetInitial(session.user.name!)}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </PopoverButton>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <PopoverPanel className="absolute right-0 z-20 mt-3 w-64 rounded-lg bg-white p-4 shadow-lg ring-1 ring-gray-200">
                        <div className="flex items-center space-x-3 border-b border-gray-200 pb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={session.user.image!}
                              alt={session.user.name!}
                            />
                            <AvatarFallback>
                              {GetInitial(session.user.name!)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="">{session.user.name}</h4>
                            <p className="text-sm text-gray-500">
                              @{session.user.username}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-col space-y-1">
                          {/*<button
                            // onClick={() => {
                            //   setIsEditProfileOpen(true)
                            // }}
                            className="px-3 py-2 text-base hover:bg-blue-100  rounded-lg text-left flex items-center gap-2"
                          >
                            <Pencil size={14} /> Edit Profile
                          </button>
                          <button
                            // onClick={() => {
                            //   openSessionsModal()
                            // }}
                            className="px-3 py-2 text-base hover:bg-blue-100  rounded-lg text-left flex items-center gap-2"
                          >
                            <Shield size={14} /> Active Sessions
                          </button>
                          <button
                            onClick={handleAddPasskey}
                            className="px-3 py-2 text-base hover:bg-blue-100  rounded-lg text-left flex items-center gap-2"
                          >
                            <Key size={14} /> Add Passkey
                          </button>*/}
                          <button
                            onClick={handleSignOut}
                            className="px-3 py-2 text-base hover:bg-blue-100  rounded-lg text-left flex items-center gap-2 text-red-600"
                          >
                            <LogOut size={14} /> Log out
                          </button>
                        </div>
                      </PopoverPanel>
                    </Transition>
                  </>
                )}
              </Popover>
            </PopoverGroup>
          )}

          {status === "unauthenticated" && (
            <div className="flex gap-4">
              <a
                href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
                className="text-base px-2 py-1 hover:bg-blue-100 rounded-md"
              >
                Log in
              </a>
              <a
                href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
                className="text-base px-2 py-1 hover:bg-blue-100 rounded-md"
              >
                Sign up
              </a>
            </div>
          )}
        </div>
        {/* --- END DESKTOP MENU --- */}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden inline-flex items-center justify-center p-2 text-gray-700 animate-fade-left"
        >
          <Bars2Icon className="h-8 w-8" />
        </button>
      </div>

      {/* --- MOBILE DRAWER --- */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        as="div"
        className="lg:hidden transition-transform "
      >
        <DialogBackdrop className="fixed inset-0 z-40 overflow-y-auto bg-black/30" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-3/4 px-5 py-3 bg-[var(--color-background)] animate-fade-left">
          <div className="flex justify-between items-center mb-4">
            <span className="h-8"></span>
            <button onClick={() => setMobileMenuOpen(false)}>
              <XMarkIcon className="h-8 w-8 text-gray-700" />
            </button>
          </div>

          {status === "loading" && (
            <div className="flex justify-center py-4">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            </div>
          )}

          {status === "authenticated" && session?.user && (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3 border-b border-gray-200 py-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={session.user.image!}
                    alt={session.user.name!}
                  />
                  <AvatarFallback>
                    {GetInitial(session.user.name!)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="">{session.user.name}</h4>
                  <p className="text-sm text-gray-500">
                    @{session.user.username}
                  </p>
                </div>
              </div>
              {/*<button
                onClick={() => {
                  setIsEditProfileOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="text-left text-base hover:bg-blue-100 px-2 rounded-lg py-2 flex items-center gap-2"
              >
                <Pencil size={16} /> Edit Profile
              </button>
              <button
                onClick={() => {
                  openSessionsModal()
                  setMobileMenuOpen(false)
                }}
                className="text-left text-base hover:bg-blue-100 px-2 rounded-lg py-2 flex items-center gap-2"
              >
                <Shield size={16} /> Active Sessions
              </button>
              <button
                onClick={() => {
                  handleAddPasskey()
                  setMobileMenuOpen(false)
                }}
                className="text-left text-base hover:bg-blue-100 px-2 rounded-lg py-2 flex items-center gap-2"
              >
                <Key size={16} /> Add Passkey
              </button>*/}
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="text-left text-base hover:bg-blue-100 px-2 rounded-lg py-2 text-red-600 flex items-center gap-2"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}

          {status === "unauthenticated" && (
            <div>
              <a
                href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
                className="text-base block py-2 px-2 hover:bg-blue-100 rounded-md"
              >
                Log in →
              </a>
              <a
                href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
                className="text-base block py-2 px-2 hover:bg-blue-100 rounded-md"
              >
                Sign up →
              </a>
            </div>
          )}
        </DialogPanel>
      </Dialog>
    </header>
  );
}
