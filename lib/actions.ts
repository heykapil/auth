"use server";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { auth } from "./auth";

export const signUp = async ({
  email,
  name,
  username,
  password,
  image,
}: {
  email: string;
  name: string;
  username: string;
  password: string;
  image?: string;
}) => {
  try {
    const data = await auth.api.signUpEmail({
      body: {
        email,
        name,
        password,
        username,
        image,
      },
    });
    if (!data) {
      return null;
    }
    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const signInWithTwitter = async () => {
  const data = await auth.api.signInSocial({
    body: {
      provider: "twitter",
    },
  });
  // if(!data){
  //   return null;
  // }
  return data;
};

export const signInWithGithub = async () => {
  try {
    const data = await auth.api.signInSocial({
      body: { provider: "github" },
    });
    if (!data) {
      return null;
    }
    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const signInWithGoogle = async () => {
  try {
    const data = await auth.api.signInSocial({
      body: { provider: "google" },
    });
    if (!data) {
      return null;
    }
    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getSession = async () => {
  const Headers = await headers();
  try {
    const data = await auth.api.getSession({
      headers: Headers,
    });
    if (!data) {
      return null;
    }
    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const signInCredentials = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const data = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
    if (!data) {
      throw new Error("something went wrong!");
    }
    return { data };
  } catch (error) {
    if (error instanceof APIError) {
      console.log(error.message, error.status);
      return { error };
    }
  }
};

export async function listUserAccounts() {
  try {
    const userAccounts = await auth.api.listUserAccounts({
      headers: await headers(),
    });
    return userAccounts;
  } catch (e: any) {
    console.log(e);
    return null;
  }
}

export async function deleteUserAccount({
  token,
  password,
}: {
  token: string;
  password: string;
}) {
  const Headers = await headers();
  try {
    const { success, message } = await auth.api.deleteUser({
      body: {
        token: token,
        password: password,
      },
      headers: Headers,
    });
    return { success, message };
  } catch (e: any) {
    console.log(e);
    return null;
  }
}

export async function listUserSessions() {
  const Headers = await headers();
  try {
    const userSessions = await auth.api.listSessions({
      headers: Headers,
    });
    return userSessions;
  } catch (e: any) {
    console.log(e);
    return [];
  }
}
