import { getSession, listUserAccounts, listUserSessions } from "@/lib/actions";
import { redirect } from "next/navigation";
import { ClientProfile } from "./client-profile";

export default async function ProfilePage() {
  const sessionData = await getSession();
  const accounts = await listUserAccounts();
  const sessions = await listUserSessions();
  if (!sessionData || !accounts || !sessions) {
    redirect("/login");
  }
  return (
    <ClientProfile
      session={sessionData.session}
      user={sessionData.user}
      sessions={sessions}
      accounts={accounts}
    />
  );
}
