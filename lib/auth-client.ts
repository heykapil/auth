import { magicLinkClient, passkeyClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient =  createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    usernameClient(),
    magicLinkClient(),
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
  resetPassword,
  sendVerificationEmail,
  changeEmail,
  deleteUser,
  linkSocial,
  forgetPassword,
  useSession,
  magicLink,
  verifyEmail,
  listAccounts,
  listSessions,
  revokeOtherSessions,
  revokeSessions,
} = authClient;


export type Session = typeof authClient.$Infer.Session
