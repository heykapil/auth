import { getSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import AdminDashboard from "./client";

export default async function AdminServerPage() {
  const session = await getSession();
  if (!session) {
    return redirect("/login?redirectTo=/admin");
  }
  if (session?.user?.username === "admin") {
    return <AdminDashboard />;
  } else {
    return (
      <div className="flex mt-16 w-full mx-auto justify-center p-2 max-w-sm flex-col gap-6">
        <h2 className="animate-fade-right text-2xl font-semibold">
          Access Denied!
        </h2>
        <p className="animate-fade-up">
          You do not have the access to admin page.
        </p>
        <p className="mt-10">
          Kindly{" "}
          <a className="font-medium underline underline-offset-2" href={`/`}>
            return back
          </a>{" "}
          to home page.
        </p>
      </div>
    );
  }
}
