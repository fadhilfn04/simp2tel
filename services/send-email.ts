import nodemailer from 'nodemailer';

export interface SendEmailContent {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonLabel?: string;
  buttonUrl?: string;
}

export interface SendEmailProps {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  content?: SendEmailContent;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  content = {},
}: SendEmailProps) {
  const { title, subtitle, description, buttonLabel, buttonUrl } = content;

  // Log to console for debugging (useful in development)
  if (buttonUrl && buttonUrl.includes('verify-email')) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📧 EMAIL VERIFICATION LINK (Development Mode)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Title: ${title}`);
    console.log(`Subtitle: ${subtitle}`);
    console.log(`\n🔗 Verification Link:`);
    console.log(buttonUrl);
    console.log('═══════════════════════════════════════════════════════════\n');
  }

  // Check if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP credentials not configured. Email not sent.');
    console.warn('To enable email sending, configure SMTP_HOST, SMTP_USER, and SMTP_PASS in .env');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `${process.env.SMTP_SENDER} <${process.env.SMTP_FROM}>`,
    to,
    subject,
    text,
    html: html || undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending email: ${error}`);
    throw error;
  }
}
