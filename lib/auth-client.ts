import { magicLinkClient, passkeyClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient =  createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  credentials: "include", // ✅ ensure cookies are included
  plugins: [
    usernameClient(),
    magicLinkClient(),
    // emailOTPClient(),
    passkeyClient()
  ]
})

export const {
  signIn,
  signOut,
  signUp,
  revokeSession,
  updateUser,
  getSession,
  changePassword,
  // emailOtp,
  resetPassword,
  sendVerificationEmail,
  changeEmail,
  deleteUser,
  linkSocial,
  forgetPassword,
  useSession,
  magicLink,
  listSessions
} = authClient;


export type Session = typeof authClient.$Infer.Session
