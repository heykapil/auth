import { APIError, betterAuth, BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin, magicLink, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { Pool } from "pg";
import { getSession } from "./actions";
import { sendDeleteAccountEmail } from "./delete-account-email";
import { sendMagicLink } from "./magic-link";
import { sendPasswordResetSuccessEmail } from "./password-reset-success-email";
import { sendResetPasswordEmail } from "./reset-password-email";
import { sendVerificationLink } from "./verification-email";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: false,
    idleTimeoutMillis: 30000,
  }),
  logger: {
    disabled: process.env.NODE_ENV === "production",
    level: "debug",
  },
  user: {
    deleteUser: {
      enabled: true,
      deleteTokenExpiresIn: 10 * 60, // 10 minutes
      beforeDelete: async () => {
        const session = await getSession();
        if (session?.user?.username === "admin") {
          throw new APIError("BAD_REQUEST", {
            message: "Can not delete admin user",
          });
        }
      },
      sendDeleteAccountVerification: async ({ user, url }) => {
        if (process.env.NODE_ENV === "development") {
          console.log("✨ Delete user link: " + url);
        } else {
          await sendDeleteAccountEmail(user.email, url);
        }
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // autoSignIn: false //defaults to true
    sendResetPassword: async ({ user, url }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("✨ Reset password link: " + url);
      } else {
        await sendResetPasswordEmail(user.email, url);
      }
    },
    onPasswordReset: async ({ user }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("✨ Password reset for: " + user.email);
      } else {
        await sendPasswordResetSuccessEmail(user.email);
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("✨ Verification link: " + url);
      } else {
        await sendVerificationLink(user.email, url);
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
    //      await sendVerificationLink(email, url);
    //    }
    //  }
    // }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
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
    admin(),
  ],
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
