import { createAuthClient } from "better-auth/react";
import { Resend } from "resend";

// Default sender email - use your verified domain in production
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// Initialize Resend with API key from environment variables
export const resend = new Resend(process.env.RESEND_API_KEY);

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
} = authClient;