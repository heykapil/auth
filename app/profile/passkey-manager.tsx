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
import { snowflake } from "@/lib/snowflake";
import { KeyIcon } from "@heroicons/react/20/solid";
import { Passkey } from "better-auth/plugins/passkey";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "./modal";

export function PasskeyManager() {
  const [open, setOpen] = useState(false);
  const [passkeys, setPasskeys] = useState<Passkey[] | null>(null);
  const [revokingStates, setRevokingStates] = useState<Record<string, boolean>>(
    {},
  );
  const [revokedStates, setRevokedStates] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    (async function setPasskey() {
      const { data, error } = await authClient.passkey.listUserPasskeys();
      if (!error) {
        setPasskeys(data);
      }
    })();
  }, []);

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
        <KeyIcon className="h-4 w-4 mr-2" />
        Active passkeys
      </Button>
      <Button
        className="gap-2"
        onClick={async () => {
          await authClient.passkey.addPasskey({
            name: snowflake.generate().toString(),
            fetchOptions: {
              onSuccess() {
                toast.success(`Passkey added!`);
              },
              onError(context) {
                toast.error("Error", {
                  description: context.error?.message,
                });
              },
            },
          });
        }}
      >
        <KeyIcon className="h-4 w-4 mr-2" />
        Add passkeys
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Active passkeys"
      >
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            View and manage your currently active passkeys across devices.
          </p>

          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Created at
                  </TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!passkeys ||
                  (passkeys.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No active passkeys found
                      </TableCell>
                    </TableRow>
                  ))}
                {passkeys?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.deviceType}
                    </TableCell>
                    <TableCell>{item?.name || "No name"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(item?.createdAt?.toISOString())}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        className="h-8 text-red-600"
                        size="sm"
                        onClick={async () =>
                          await authClient.passkey.deletePasskey({
                            id: item.id,
                            fetchOptions: {
                              onRequest() {
                                setRevokingStates((prev) => ({
                                  ...prev,
                                  [item.id]: true,
                                }));
                              },
                              onSuccess() {
                                setRevokedStates((prev) => ({
                                  ...prev,
                                  [item.id]: true,
                                }));
                                toast.success(`Passkey removed!`);
                              },
                              onError(context) {
                                setRevokingStates((prev) => ({
                                  ...prev,
                                  [item.id]: false,
                                }));
                                toast.error("Error", {
                                  description: context.error?.message,
                                });
                              },
                            },
                          })
                        }
                      >
                        <X className="h-4 w-4 mr-1" />
                        {revokedStates[item.id]
                          ? `Removed`
                          : revokingStates[item.id]
                            ? "Removing..."
                            : "Remove"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Modal>
    </>
  );
}
