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
  ArrowUpDown,
  Ban,
  CalendarIcon,
  Check,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Shield,
  Trash,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { toast } from "sonner";

const Button = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-100 text-gray-900 hover:bg-gray-200 h-10 py-2 px-4 border border-gray-200",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const PrimaryButton = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 hover:bg-blue-700 h-10 py-2 px-4",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className="flex h-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  );
};

const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className="block text-base font-medium text-gray-700 mb-1"
      {...props}
    />
  );
};

const MenuButton = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cn(
        "flex w-full items-center px-4 py-2.5 text-base text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

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

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"email" | "name">("email");
  const [sortBy, setSortBy] = useState<"createdAt" | "email" | "name">(
    "createdAt",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data: allUsers, isLoading: isUsersLoading } = useQuery<
    UserWithRole[]
  >({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await client.admin.listUsers(
        {
          query: {
            limit: 1000, // Fetch all users
            offset: 0,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        },
        { throw: true },
      );
      return data?.users || [];
    },
  });

  // Client-side filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    if (!allUsers) return [];

    let filtered = [...allUsers];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((user) => {
        if (searchFilter === "email") {
          return user.email.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (searchFilter === "name") {
          return (
            user.name &&
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      if (sortBy === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else if (sortBy === "email") {
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
      } else if (sortBy === "name") {
        aValue = (a.name || "").toLowerCase();
        bValue = (b.name || "").toLowerCase();
      } else {
        return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allUsers, searchQuery, searchFilter, sortBy, sortDirection]);

  // Client-side pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredAndSortedUsers.slice(startIndex, endIndex);
  }, [filteredAndSortedUsers, page, limit]);

  const totalUsers = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalUsers / limit) || 1;

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
    } catch (error) {
      toast.error((error as Error).message || "Failed to create user");
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
    } catch (error) {
      toast.error((error as Error).message || "Failed to delete user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleRevokeSessions = async (id: string) => {
    setIsLoading(`revoke-${id}`);
    try {
      await client.admin.revokeUserSessions({ userId: id });
      toast.success("Sessions revoked for user");
    } catch (error) {
      toast.error((error as Error).message || "Failed to revoke sessions");
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
    } catch (error) {
      toast.error((error as Error).message || "Failed to impersonate user");
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
    } catch (error) {
      toast.error((error as Error).message || "Failed to ban user");
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
    } catch (error) {
      toast.error((error as Error).message || "Failed to unban user");
    } finally {
      setIsLoading(undefined);
    }
  };

  const toggleSort = (column: "createdAt" | "email" | "name") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const roles = ["user", "admin"];

  return (
    <div className="mx-auto max-w-7xl sm:p-6 lg:p-8 bg-background">
      <div className="rounded-lg">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <PrimaryButton onClick={() => setIsCreateUserOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create User
          </PrimaryButton>
        </div>
        <div className="p-1">
          {isUsersLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                <div className="flex-1 w-full sm:w-auto">
                  <Input
                    placeholder={`Search by ${searchFilter}...`}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full p-1 border-b border-gray-600 focus:outline-none"
                  />
                </div>
                <select
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value as "email" | "name");
                    setPage(1);
                  }}
                  className="h-10 rounded-md border border-gray-300 bg-white px-3 text-base focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  <option value="email">Search by Email</option>
                  <option value="name">Search by Name</option>
                </select>
              </div>
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="text-base">
                      <th
                        scope="col"
                        className="px-6 py-3 text-left font-medium uppercase tracking-wider text-gray-700"
                      >
                        <button
                          onClick={() => toggleSort("email")}
                          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                        >
                          Email
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left font-medium uppercase tracking-wider text-gray-700"
                      >
                        <button
                          onClick={() => toggleSort("name")}
                          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                        >
                          Name
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left font-medium uppercase tracking-wider text-gray-700"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left  font-medium uppercase tracking-wider text-gray-700"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left  font-medium uppercase tracking-wider text-gray-700"
                      >
                        <button
                          onClick={() => toggleSort("createdAt")}
                          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                        >
                          Created
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right font-medium uppercase tracking-wider text-gray-700"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-base text-gray-500"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-base text-gray-900">
                            {user.email}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-base text-gray-900">
                            {user.name || "—"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-base text-gray-900 capitalize">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-medium text-blue-800 border border-blue-200">
                              {user.role || "user"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {user.banned ? (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-sm font-semibold text-red-800 border border-red-200">
                                Banned
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-sm font-semibold text-green-800 border border-green-200">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-base text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-base font-medium">
                            <Popover className="relative inline-block text-left">
                              <PopoverButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors">
                                <MoreHorizontal className="h-5 w-5" />
                              </PopoverButton>
                              <PopoverPanel className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[#faf9f6] border border-gray-200 focus:outline-none">
                                <div className="py-1">
                                  <MenuButton
                                    onClick={() =>
                                      handleImpersonateUser(user.id)
                                    }
                                    disabled={isLoading?.startsWith(
                                      "impersonate",
                                    )}
                                  >
                                    {isLoading === `impersonate-${user.id}` ? (
                                      <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                                    ) : (
                                      <UserCircle className="mr-3 h-4 w-4" />
                                    )}
                                    Impersonate User
                                  </MenuButton>
                                  <MenuButton
                                    onClick={() =>
                                      handleRevokeSessions(user.id)
                                    }
                                    disabled={isLoading?.startsWith("revoke")}
                                  >
                                    {isLoading === `revoke-${user.id}` ? (
                                      <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                                    ) : (
                                      <RefreshCw className="mr-3 h-4 w-4" />
                                    )}
                                    Revoke Sessions
                                  </MenuButton>
                                  <MenuButton
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
                                  >
                                    {isLoading === `ban-${user.id}` ? (
                                      <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                                    ) : user.banned ? (
                                      <>
                                        <Shield className="mr-3 h-4 w-4" />
                                        Unban User
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="mr-3 h-4 w-4" />
                                        Ban User
                                      </>
                                    )}
                                  </MenuButton>
                                  <div className="border-t border-gray-100 my-1" />
                                  <MenuButton
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={isLoading?.startsWith("delete")}
                                    className="text-red-700 hover:bg-red-50"
                                  >
                                    {isLoading === `delete-${user.id}` ? (
                                      <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash className="mr-3 h-4 w-4" />
                                    )}
                                    Delete User
                                  </MenuButton>
                                </div>
                              </PopoverPanel>
                            </Popover>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-4">
                <div className="flex items-center gap-3">
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-10 rounded-md border border-gray-300 bg-white px-3 text-base focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    {[10, 25, 50, 100].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                      </option>
                    ))}
                  </select>
                  <p className="text-base text-gray-600">
                    Showing{" "}
                    {paginatedUsers.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
                    {Math.min(page * limit, totalUsers)} of {totalUsers} users
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-base text-gray-600 px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages || totalUsers === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
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
          <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md space-y-4 rounded-xl border border-gray-200 bg-[#faf9f6] p-6 shadow-xl">
              <DialogTitle className="text-2xl font-bold text-gray-900">
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
                      <ListboxButton className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-left text-base focus:outline-none focus:ring-2 focus:ring-gray-400">
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
                      <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {roles.map((role) => (
                          <ListboxOption
                            key={role}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2.5 pl-10 pr-4 ${
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
          <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md space-y-4 rounded-xl border border-gray-200 bg-[#faf9f6] p-6 shadow-xl">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Ban User
              </DialogTitle>
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
