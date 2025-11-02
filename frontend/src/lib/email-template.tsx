export function getResetPasswordEmailHtml(email: string, resetUrl: string): string {
    return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width">
  <title>Reset Your Password</title>
  </head>
  <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f5;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f4f5;padding:24px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:8px;padding:32px;">
          <tr><td align="left" style="color:#111827;">
            <h1 style="margin:0 0 16px;font-size:20px;">Reset your password</h1>
            <p style="margin:0 0 16px;font-size:14px;">Hi ${email}, click the button below to reset your password.</p>
            <p style="margin:0 0 24px;"><a href="${resetUrl}" style="display:inline-block;padding:12px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
            <p style="margin:0 0 16px;font-size:12px;color:#6b7280;">If you didn’t request this, you can safely ignore this email.</p>
            <p style="margin:0;font-size:12px;color:#6b7280;word-break:break-all;">Reset link: ${resetUrl}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;
  }
  