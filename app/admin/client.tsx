"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient as client } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserWithRole } from "better-auth/plugins";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Ban,
  CalendarIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Shield,
  Trash,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isBanUserOpen, setIsBanUserOpen] = useState(false);
  const [newUser, setNewUser] = useState<{
    email: string;
    password: string;
    name: string;
    role: "user" | "admin";
  }>({
    email: "",
    password: "",
    name: "",
    role: "user",
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
    <div className="mx-auto max-w-7xl p-3 sm:p-6 lg:p-8">
      <div className="rounded-lg">
        <div className="flex flex-row items-center justify-between">
          <h3 className=" text-gray-900">Admin Panel</h3>
          <Button onClick={() => setIsCreateUserOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create User
          </Button>
        </div>
        <div>
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
                    className="w-full border-gray-300"
                  />
                </div>
                <Select
                  value={searchFilter}
                  onValueChange={(value: "email" | "name") => {
                    setSearchFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px] h-10 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Search by Email</SelectItem>
                    <SelectItem value="name">Search by Name</SelectItem>
                  </SelectContent>
                </Select>
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-56 bg-[#faf9f6]"
                              >
                                <DropdownMenuItem
                                  onClick={() => handleImpersonateUser(user.id)}
                                  disabled={isLoading?.startsWith(
                                    "impersonate",
                                  )}
                                  className="cursor-pointer"
                                >
                                  {isLoading === `impersonate-${user.id}` ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <UserCircle className="mr-2 h-4 w-4" />
                                  )}
                                  Impersonate User
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRevokeSessions(user.id)}
                                  disabled={isLoading?.startsWith("revoke")}
                                  className="cursor-pointer"
                                >
                                  {isLoading === `revoke-${user.id}` ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                  )}
                                  Revoke Sessions
                                </DropdownMenuItem>
                                <DropdownMenuItem
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
                                  className="cursor-pointer"
                                >
                                  {isLoading === `ban-${user.id}` ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : user.banned ? (
                                    <>
                                      <Shield className="mr-2 h-4 w-4" />
                                      Unban User
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="mr-2 h-4 w-4" />
                                      Ban User
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={isLoading?.startsWith("delete")}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  {isLoading === `delete-${user.id}` ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash className="mr-2 h-4 w-4" />
                                  )}
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-4">
                <div className="flex items-center gap-3">
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => {
                      setLimit(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[130px] h-10 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 25, 50, 100].map((pageSize) => (
                        <SelectItem key={pageSize} value={pageSize.toString()}>
                          Show {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-base text-gray-600">
                    Showing{" "}
                    {paginatedUsers.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
                    {Math.min(page * limit, totalUsers)} of {totalUsers} users
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-base text-gray-600 px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
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
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="bg-[#faf9f6] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Create New User
            </DialogTitle>
          </DialogHeader>
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
                className="mt-1"
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
                className="mt-1"
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
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: string) =>
                  setNewUser({ ...newUser, role: value as "user" | "admin" })
                }
              >
                <SelectTrigger className="mt-1 h-10 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
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
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={isBanUserOpen} onOpenChange={setIsBanUserOpen}>
        <DialogContent className="bg-[#faf9f6] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Ban User
            </DialogTitle>
          </DialogHeader>
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
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="expirationDate"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !banForm.expirationDate && "text-gray-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {banForm.expirationDate ? (
                      format(banForm.expirationDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <Calendar
                    mode="single"
                    selected={banForm.expirationDate}
                    onSelect={(date) =>
                      setBanForm({ ...banForm, expirationDate: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
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
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
