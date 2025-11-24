// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
import { resetPassword } from "@/lib/resend";
import { send } from "process";

export const MESSAGES = {
  auth: {
    // generic
    signInFailed: "Unable to sign you in. Please try again.",
    signUpFailed: "Unable to create your account. Please try again.",

    // specific
    invalidCredentials: "Invalid email or password",
    emailInUse: "This email is already in use.",
    passwordTooShort: "Password must be at least 8 characters.",
    passwordsDontMatch: "Passwords do not match.",
    missingResetToken: "Invalid or missing reset token.",
  },

  forgotPassword: {
    emailSentAlert:
      "If this email exists in our system, we’ve sent you a password reset link.",
    sendFailed: "Failed to send password reset email.",
    genericError: "An error occurred while requesting password reset.",
    emailSent: "Password reset link sent to:",
    sending: "Sending...",
    sendReset: "Send Reset Link",
  },

  resetPassword: {
    success: "Password reset successfully. Redirecting to login…",
    failed:
      "Failed to reset password. The link may be invalid or has already been used.",
    genericError: "An error occurred. Please try again.",
    resetError: "Reset password error:",
    resetting: "Resetting...",
    resetPassword: "Reset Password",
  },

  chat: {
    intro:
      "Hi! I’m your education advisor. Ask me anything! e.g. “What degree do I need to become a data scientist?”",
    requestFailedMsg:
      "Sorry! Something went wrong talking to the advisor. Please try again.",
    usagePrefix: "Total API Usage:",
    limitExceeded: "⚠️ You have exceeded the free 20-message limit.",
    suggestion1: "What degree do I need to become a data scientist?",
    suggestion2: "Which courses help me transition into ML engineering?",
    suggestion3: "What’s the difference between a BSc and a BASc?",
    requestFailed: "Request failed",
    noResponse: "(no response)",
    placeholder: "Ask about programs, degrees, admissions, or career paths…",
  },

  dashboard: {
    totalApiRequests: "Total API Requests:",
  },

  admin: {
    accessDenied: "❌ Access Denied — Admin Only",
    checkingPermissions: "Checking permissions…",
    checkingAccess: "Checking access…",
    onlyAdmins: "🚫 Access Denied — Only administrators can view this page.",
    deleteUserFailed: "Failed to delete user.",
    promoteUserFailed: "Failed to promote user.",
    promoteUserSuccess: "User promoted.",
  },

  general: {
    loading: "Loading…",
  },
};