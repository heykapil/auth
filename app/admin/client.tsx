"use client";

import { authClient as client } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserWithRole } from "better-auth/plugins";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  RefreshCw,
  Trash,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Toaster, toast } from "sonner";

// Custom Button Component
const Button = ({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-md border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

const PrimaryButton = ({
  className,
  ...props
}: React.ComponentProps<"button">) => (
  <Button
    className={cn(
      "border-transparent bg-gray-900 text-white hover:bg-gray-800",
      className,
    )}
    {...props}
  />
);

const DestructiveButton = ({
  className,
  ...props
}: React.ComponentProps<"button">) => (
  <Button
    className={cn(
      "border-transparent bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      className,
    )}
    {...props}
  />
);

// Custom Input and Label Components
const Input = (props: React.ComponentProps<"input">) => (
  <input
    className="w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
    {...props}
  />
);

const Label = (props: React.ComponentProps<"label">) => (
  <label className="block text-sm font-medium text-gray-700" {...props} />
);

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isBanUserOpen, setIsBanUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
    role: "user" as const,
  });
  const [isLoading, setIsLoading] = useState<string | undefined>();
  const [banForm, setBanForm] = useState({
    userId: "",
    reason: "",
    expirationDate: undefined as Date | undefined,
  });

  const { data: users, isLoading: isUsersLoading } = useQuery<UserWithRole[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await client.admin.listUsers(
        {
          query: {
            limit: 10,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        },
        { throw: true },
      );
      // @ts-ignore
      return data?.users || [];
    },
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("create");
    try {
      await client.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role,
      });
      toast.success("User created successfully");
      setNewUser({ email: "", password: "", name: "", role: "user" });
      setIsCreateUserOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setIsLoading(`delete-${id}`);
    try {
      await client.admin.removeUser({ userId: id });
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleRevokeSessions = async (id: string) => {
    setIsLoading(`revoke-${id}`);
    try {
      await client.admin.revokeUserSessions({ userId: id });
      toast.success("Sessions revoked for user");
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke sessions");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleImpersonateUser = async (id: string) => {
    setIsLoading(`impersonate-${id}`);
    try {
      await client.admin.impersonateUser({ userId: id });
      toast.success("Impersonated user");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to impersonate user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(`ban-${banForm.userId}`);
    try {
      if (!banForm.expirationDate) {
        throw new Error("Expiration date is required");
      }
      await client.admin.banUser({
        userId: banForm.userId,
        banReason: banForm.reason,
        banExpiresIn: banForm.expirationDate.getTime() - new Date().getTime(),
      });
      toast.success("User banned successfully");
      setIsBanUserOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to ban user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    setIsLoading(`ban-${userId}`);
    try {
      await client.admin.unbanUser({ userId });
      toast.success("User unbanned successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to unban user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const roles = ["user", "admin"];

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 bg-background">
      <Toaster richColors position="top-center" />
      <div className="rounded-lg border border-gray-200 bg-background">
        <div className="flex flex-row items-center justify-between p-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <PrimaryButton onClick={() => setIsCreateUserOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create User
          </PrimaryButton>
        </div>
        <div className="p-6">
          {isUsersLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-background">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Banned
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-background">
                  {users?.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                        {user.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 capitalize">
                        {user.role || "user"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.banned ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <DestructiveButton
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isLoading?.startsWith("delete")}
                            className="h-8 w-8 p-0"
                          >
                            {isLoading === `delete-${user.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </DestructiveButton>
                          <Button
                            onClick={() => handleRevokeSessions(user.id)}
                            disabled={isLoading?.startsWith("revoke")}
                            className="h-8 w-8 p-0"
                          >
                            {isLoading === `revoke-${user.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => handleImpersonateUser(user.id)}
                            disabled={isLoading?.startsWith("impersonate")}
                            className="h-8 p-2"
                          >
                            {isLoading === `impersonate-${user.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserCircle className="mr-2 h-4 w-4" />
                                Impersonate
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              if (user.banned) {
                                handleUnbanUser(user.id);
                              } else {
                                setBanForm({
                                  userId: user.id,
                                  reason: "",
                                  expirationDate: undefined,
                                });
                                setIsBanUserOpen(true);
                              }
                            }}
                            disabled={isLoading?.startsWith("ban")}
                            className="h-8 p-2"
                          >
                            {isLoading === `ban-${user.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.banned ? (
                              "Unban"
                            ) : (
                              "Ban"
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Dialog */}
      <Transition appear show={isCreateUserOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsCreateUserOpen(false)}
        >
          <div className="fixed inset-0 bg-white/30" aria-hidden="true" />
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md space-y-4 rounded-xl border border-gray-200 bg-[#faf9f6] p-6">
              <DialogTitle className="text-xl font-bold">
                Create New User
              </DialogTitle>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Listbox
                    value={newUser.role}
                    onChange={(value) =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <div className="relative mt-1">
                      <ListboxButton className="relative w-full cursor-default rounded-md border border-gray-200 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-gray-400 sm:text-sm">
                        <span className="block truncate capitalize">
                          {newUser.role}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </ListboxButton>
                      <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {roles.map((role) => (
                          <ListboxOption
                            key={role}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-900"
                              }`
                            }
                            value={role}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate capitalize ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {role}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                                    <Check
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>
                </div>
                <PrimaryButton
                  type="submit"
                  className="w-full"
                  disabled={isLoading === "create"}
                >
                  {isLoading === "create" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </PrimaryButton>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      </Transition>

      {/* Ban User Dialog */}
      <Transition appear show={isBanUserOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsBanUserOpen(false)}
        >
          <div className="fixed inset-0 bg-white/30" aria-hidden="true" />
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4 ">
            <DialogPanel className="w-full max-w-md space-y-4 rounded-xl border border-gray-200 bg-[#faf9f6] p-6">
              <DialogTitle className="text-xl font-bold">Ban User</DialogTitle>
              <form onSubmit={handleBanUser} className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={banForm.reason}
                    onChange={(e) =>
                      setBanForm({ ...banForm, reason: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Popover className="relative">
                    <PopoverButton
                      as={Button}
                      id="expirationDate"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !banForm.expirationDate && "text-gray-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {banForm.expirationDate ? (
                        format(banForm.expirationDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </PopoverButton>
                    <PopoverPanel className="z-10 w-auto rounded-md border border-gray-200 bg-white p-0 shadow-lg">
                      <DayPicker
                        mode="single"
                        selected={banForm.expirationDate}
                        onSelect={(date) =>
                          setBanForm({ ...banForm, expirationDate: date })
                        }
                        initialFocus
                      />
                    </PopoverPanel>
                  </Popover>
                </div>
                <PrimaryButton
                  type="submit"
                  className="w-full"
                  disabled={isLoading === `ban-${banForm.userId}`}
                >
                  {isLoading === `ban-${banForm.userId}` ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Banning...
                    </>
                  ) : (
                    "Ban User"
                  )}
                </PrimaryButton>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
