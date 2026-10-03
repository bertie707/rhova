import { Resend } from "resend";

// No custom domain yet, so this sends from Resend's shared address — works
// immediately, no DNS setup. Swap for "noreply@yourdomain.com" (and verify
// that domain with Resend) once Rhova has its own domain.
const FROM_ADDRESS = "Rhova <onboarding@resend.dev>";

function client(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY env var is not set");
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(to: string, code: string): Promise<void> {
  // The Resend SDK returns { data, error } rather than throwing on
  // API-level failures (bad recipient, etc.) — surface those explicitly so
  // a silent failure doesn't look like a sent email.
  const { error } = await client().emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `${code} is your Rhova password reset code`,
    text: `Your password reset code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
  });
  if (error) throw new Error(`Resend failed to send: ${error.message}`);
}
