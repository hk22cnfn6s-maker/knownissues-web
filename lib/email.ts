import { Resend } from 'resend'
import { render } from '@react-email/render'
import GuideDeliveryEmail from '@/emails/guide-delivery'

// Initialised lazily so the module can be imported at build time
// without a real API key present in the environment.
function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const verifyUrl = `${siteUrl}/verify/${token}`

  const resend = getResend()
  await resend.emails.send({
    from: 'noreply@knownissues.co.uk',
    to,
    subject: 'Confirm your email — KnownIssues.co.uk',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm your email</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #e0e0e0;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#000000;letter-spacing:-0.3px;">
                KnownIssues.co.uk
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#000000;">
                Confirm your email address
              </h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#444444;">
                Thanks for registering. Click the button below to verify your
                email address and activate your account.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#000000;border-radius:4px;">
                    <a href="${verifyUrl}"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.1px;">
                      Confirm email address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#888888;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0;font-size:13px;color:#888888;word-break:break-all;">
                <a href="${verifyUrl}" style="color:#000000;">${verifyUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e0e0e0;background:#fafafa;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;">
                This link expires in 24 hours. If you didn't create an account,
                you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}

export async function sendGuideDeliveryEmail(
  to: string,
  guideTitle: string,
  pdfBuffer: Buffer,
  pdfFilename: string
): Promise<void> {
  const element = GuideDeliveryEmail({ guideTitle })

  const html = await render(element)
  const text = await render(element, { plainText: true })

  const resend = getResend()
  await resend.emails.send({
    from: 'guides@knownissues.co.uk',
    to,
    subject: `Your ${guideTitle} — KnownIssues.co.uk`,
    html,
    text,
    attachments: [{ filename: pdfFilename, content: pdfBuffer }],
  })
}
