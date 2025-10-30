"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { parseUserAgent } from "@/lib/user-agent";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "./modal";

export default function SessionsManager({
  sessions,
  session,
}: {
  session: any;
  sessions: any[];
}) {
  const [open, setOpen] = useState(false);
  const [revokingStates, setRevokingStates] = useState<Record<string, boolean>>(
    {},
  );
  const [revokedStates, setRevokedStates] = useState<Record<string, boolean>>(
    {},
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <>
      <Button className="gap-2" onClick={() => setOpen(true)}>
        <UserGroupIcon className="h-4 w-4 mr-2" />
        Active sessions
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Active Sessions"
      >
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            View and manage your currently active sessions across devices.
          </p>

          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device / Browser</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Last Active
                  </TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {parseUserAgent(item.userAgent)}
                      {session?.ipAddress === item.ipAddress && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{item.ipAddress}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        className="h-8"
                        variant={"destructive"}
                        size="sm"
                        onClick={async () =>
                          await authClient.revokeSession({
                            token: item.token,
                            fetchOptions: {
                              onRequest() {
                                setRevokingStates((prev) => ({
                                  ...prev,
                                  [item.token]: true,
                                }));
                              },
                              onSuccess() {
                                setRevokedStates((prev) => ({
                                  ...prev,
                                  [item.token]: true,
                                }));
                                toast.success(`Session revoked!`);
                              },
                              onError(context) {
                                setRevokingStates((prev) => ({
                                  ...prev,
                                  [item.token]: false,
                                }));
                                toast.error("Error", {
                                  description: context.error?.message,
                                });
                              },
                            },
                          })
                        }
                        disabled={
                          item.ipAddress === session?.ipAddress ||
                          revokedStates[item.token] === true ||
                          revokingStates[item.token] === true
                        }
                      >
                        <X className="h-4 w-4 mr-1" />
                        {revokedStates[item.token]
                          ? `Revoked`
                          : revokingStates[item.token]
                            ? "Revoking..."
                            : "Revoke"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sessions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No active sessions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              The device and browser detection might not be 100% accurate.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
