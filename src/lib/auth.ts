import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/lib/generated/prisma";
import { getResetPasswordEmailHtml } from "@/lib/email-template";
import { FROM_EMAIL, resend } from "@/lib/resend";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    // This sends the reset email using Resend
    sendResetPassword: async ({ user, url }) => {
      try {
        const emailHtml = getResetPasswordEmailHtml(user.email, url);

        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: "Reset your password",
          html: emailHtml,
        });

        if (error) throw error;
        if (process.env.NODE_ENV === "development") {
          console.log("[DEV] Reset URL:", url);
        }
        console.log("Reset email sent:", data?.id, "to", user.email);
      } catch (err) {
        console.error("sendResetPassword error:", err);
        throw err;
      }
    },
  },
  email: {
    enabled: false, // possible to enable magic links if needed later
  },
});
