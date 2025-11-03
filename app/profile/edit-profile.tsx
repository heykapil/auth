"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Session } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { GetInitial } from "@/lib/get-initials";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  image: z.string().url("Invalid image URL"),
});

export default function EditProfile({ session, user }: Session) {
  const [open, setOpen] = useState(false);
  const [isLoading, setisLoading] = useState<boolean>(false);
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      image: user?.image || "",
    },
  });

  async function onSubmit(values: any) {
    try {
      await authClient
        .updateUser({
          image: values?.image,
          name: values?.name,
          username: values?.username,
          fetchOptions: {
            onRequest() {
              setisLoading(true);
            },
            onSuccess() {
              setisLoading(false);
              toast.success("Profile updated!", {
                description: "Kindly refresh the page to see changes!",
              });
            },
            onError(context) {
              toast.error("Error", {
                description:
                  context.error?.message || context.error?.statusText,
              });
            },
          },
        })
        .then(() => setisLoading(false));
    } catch (e: any) {
      toast.error("Error occured!", {
        description: e?.message || "Something went wrong!",
      });
    }
    setOpen(false);
  }

  return (
    <div className="flex flex-col items-center bg-white">
      <Button onClick={() => setOpen(true)}>Edit Profile</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4 bg-background"
            >
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={form.watch("image")} alt="Profile Image" />
                  <AvatarFallback>{GetInitial(user?.name)}</AvatarFallback>
                </Avatar>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="url" placeholder="Image URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:scale-101 duration-300 ease-in-out text-base"
                disabled={isLoading}
              >
                {isLoading ? `Saving...` : `Save`}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
