"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { authClient } from "@/lib/auth-client"
import { parseUserAgent } from "@/lib/user-agent"
import { Shield, X } from "lucide-react"
import { useState } from "react"

export default function SessionsManager({ sessions, session }:{ session: any, sessions: any }) {
  const [open, setOpen] = useState(false);
  const [revokingStates, setRevokingStates] = useState<Record<string, boolean>>({});
  const [revokedStates, setRevokedStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Shield className="h-4 w-4 mr-2" />
          Active sessions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] bg-white">
        <DialogHeader>
          <DialogTitle>Active Sessions</DialogTitle>
          <DialogDescription>View and manage your currently active sessions across devices.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device / Browser</TableHead>
                <TableHead>IP Address</TableHead>
                {/* <TableHead className="hidden md:table-cell">Location</TableHead> */}
                <TableHead className="hidden md:table-cell">Last Active</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((item:any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {parseUserAgent(item.userAgent)}
                    {session?.ipAddress === item.ipAddress && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Current</span>
                    )}
                  </TableCell>
                  <TableCell>{item.ipAddress}</TableCell>
                  {/* <TableCell className="hidden md:table-cell">{item.location}</TableCell> */}
                  <TableCell className="hidden md:table-cell">{formatDate(item.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      className='h-8'
                      variant={'destructive'}
                      size="sm"
                      onClick={async () => await authClient.revokeSession({
                          token: item.token,
                          fetchOptions: {
                            onRequest(){
                              setRevokingStates(prev => ({ ...prev, [item.token]: true }));
                            },
                            onSuccess() {
                              setRevokedStates(prev => ({ ...prev, [item.token]: true }))
                              toast({title:`Session revoked!`, variant: `default`});
                             },
                             onError(context) {
                               setRevokingStates(prev => ({ ...prev, [item.token]: false }));
                               toast({ title: 'Error' , description: context.error?.message, variant: 'destructive' });
                             }
                          }
                      })}
                      disabled={item.ipAddress === session?.ipAddress || revokedStates[item.token] === true || revokingStates[item.token] === true}
                    >
                      <X className="h-4 w-4 mr-1" />
                      {revokedStates[item.token] ? `Revoked` : (revokingStates[item.token] ? 'Revoking...' : 'Revoke')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No active sessions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="text-left">
          <DialogDescription className="text-left">The device and browser detection might not be 100% accurate.</DialogDescription>
          </div>
      </DialogContent>
    </Dialog>
  )
}
