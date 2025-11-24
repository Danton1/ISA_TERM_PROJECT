// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
import { createAuthClient } from "better-auth/react";

// If NEXT_PUBLIC_APP_URL is not set, default to localhost for dev
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgetPassword,
  resetPassword,
} = createAuthClient();
