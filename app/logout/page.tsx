import { Suspense } from "react";
import ClientLogoutPage from "./client";

export default function LogoutPage(){
  return <Suspense>
    <ClientLogoutPage />
  </Suspense>
}
