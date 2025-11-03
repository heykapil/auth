import { betterAuth, BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { Pool } from "pg";
import { sendEmail } from "./email";
import { sendMagicLink } from "./magic-link";
import { sendVerificationLink } from "./verification-email";
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: true,
  }),
  logger: {
    disabled: process.env.NODE_ENV === "production",
    level: "debug",
  },
  user: {
    deleteUser: {
      enabled: true,
      deleteTokenExpiresIn: 10 * 60, // 10 seconds
      sendDeleteAccountVerification: async ({ user, url }) => {
        if (process.env.NODE_ENV === "development") {
          console.log("✨ Delete user link: " + url);
        } else {
          await sendEmail(
            user.email,
            "Delete your account!",
            `<p>Click the link to delete your account assosiated with ${user.email} on auth.kapil.app: <a href=${url}>${url}</a></p>`,
          );
        }
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // autoSignIn: false //defaults to true
    sendResetPassword: async ({ user, url }, request) => {
      if (process.env.NODE_ENV === "development") {
        console.log("✨ Verification link: " + url);
      } else {
        await sendEmail(
          user.email,
          "Reset your password",
          `<p>Click the link to reset your password for auth.kapil.app: <a href=${url}>${url}</a></p>`,
        );
      }
    },
    onPasswordReset: async ({ user }, request) => {
      if (process.env.NODE_ENV === "development") {
        console.log("✨ Password reset for: " + user.email);
      } else {
        await sendEmail(
          user.email,
          "Password has been reset",
          `<p>Password for account of the user ${user.email} on auth.kapil.app has been reset as per your request.</p>`,
        );
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      if (process.env.NODE_ENV === "development") {
        console.log("✨ Verification link: " + url);
      } else {
        await sendVerificationLink(user.email, url, token);
      }
    },
    sendOnSignIn: true,
    // sendOnSignUp: true,
    expiresIn: 10 * 60, // 10 minutes
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      // scope: ['user.email']
    },
  },
  trustedOrigins: ["http://localhost:3000", "*.kapil.app", "kapil.app"],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NODE_ENV === "production" ? "kapil.app" : "localhost",
    },
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production" ? true : false,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    useSecureCookies: process.env.NODE_ENV === "production" ? true : false,
    cookiePrefix: "kapil.app",
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
    expiresIn: 60 * 60 * 24 * 15, // 15 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },
  rateLimit: {
    window: 60, // time window in seconds
    max: 100, // max requests in the window
  },
  plugins: [
    username(),
    passkey(),
    // emailOTP({
    //  async sendVerificationOTP({ email, otp }) {
    //    if (process.env.NODE_ENV === "development") {
    //      console.log("✨ Verification OTP: " + otp);
    //    } else {
    //      const url = process.env.BETTER_AUTH_URL + `/api/auth/verify-email?email=${email}&otp=${otp}`;
    //      await sendVerificationLink(email, url, otp);
    //    }
    //  }
    // }),
    magicLink({
      sendMagicLink: async ({ email, url }, request) => {
        if (process.env.NODE_ENV === "development") {
          console.log("✨ Magic link: " + url);
        } else {
          await sendMagicLink(email, url);
        }
      },
      expiresIn: 60 * 10, // 10 minutes
      disableSignUp: false,
    }),
    nextCookies(),
  ],
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
