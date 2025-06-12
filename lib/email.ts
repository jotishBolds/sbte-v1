import nodemailer from "nodemailer";

// Email template types
type EmailTemplate = "OTP_LOGIN" | "OTP_RESET_PASSWORD" | "PASSWORD_CHANGED";

// Configure transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Enhanced security settings
  secure: true,
  tls: {
    rejectUnauthorized: true,
  },
});

// Base email template
const getBaseTemplate = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            background-color: #f8f9fa;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header img {
            max-width: 150px;
            height: auto;
        }

        .content {
            color: #374151;
        }

        .code-container {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }

        .code {
            font-size: 32px;
            letter-spacing: 8px;
            font-weight: 600;
            color: #111827;
            font-family: monospace;
        }

        .notice {
            background-color: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #991b1b;
            font-size: 14px;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }

        @media screen and (max-width: 600px) {
            body {
                padding: 10px;
            }

            .container {
                padding: 20px;
            }

            .code {
                font-size: 24px;
                letter-spacing: 6px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="cid:logo" alt="SBTE Logo" />
        </div>
        {{content}}
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SBTE. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>
`;

// Email templates
const templates = {
  OTP_RESET_PASSWORD: (otp: string) => ({
    subject: "Password Reset OTP - SBTE",
    content: `
      <div class="content">
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Use the following OTP to continue:</p>
        
        <div class="code-container">
          <div class="code">${otp}</div>
        </div>
        
        <p>This OTP will expire in 5 minutes.</p>
        
        <div class="notice">
          <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email and ensure your account is secure.
        </div>
        
        <p>For security reasons:</p>
        <ul>
          <li>Never share this OTP with anyone</li>
          <li>SBTE staff will never ask for your OTP</li>
          <li>Report any suspicious activity to support</li>
        </ul>
      </div>
    `,
  }),
  OTP_LOGIN: (otp: string) => ({
    subject: "Login Verification OTP - SBTE",
    content: `
      <div class="content">
        <h2>Login Verification</h2>
        <p>Use the following OTP to verify your login:</p>
        
        <div class="code-container">
          <div class="code">${otp}</div>
        </div>
        
        <p>This OTP will expire in 5 minutes.</p>
        
        <div class="notice">
          <strong>Security Notice:</strong> If you did not attempt to login, someone else may be trying to access your account.
        </div>
      </div>
    `,
  }),
  PASSWORD_CHANGED: () => ({
    subject: "Password Changed Successfully - SBTE",
    content: `
      <div class="content">
        <h2>Password Changed Successfully</h2>
        <p>Your password has been successfully changed.</p>
        
        <div class="notice">
          <strong>Security Notice:</strong> If you did not make this change, please contact support immediately.
        </div>
        
        <p>For account security:</p>
        <ul>
          <li>Log out of all other devices</li>
          <li>Enable two-factor authentication if not already enabled</li>
          <li>Review your recent account activity</li>
        </ul>
      </div>
    `,
  }),
};

export async function sendEmail(
  to: string,
  template: EmailTemplate,
  data?: { otp?: string }
) {
  try {
    const templateFn = templates[template];
    if (!templateFn) {
      throw new Error(`Template ${template} not found`);
    }

    const { subject, content } = templateFn(data?.otp || "");
    const htmlContent = getBaseTemplate().replace("{{content}}", content);

    const mailOptions = {
      from: {
        name: "SBTE Support",
        address: process.env.EMAIL_USER!,
      },
      to,
      subject,
      html: htmlContent,
      text: `${subject}\n\n${
        data?.otp ? `Your OTP is: ${data.otp}\n\n` : ""
      }This is an automated message, please do not reply.`,
      attachments: [
        {
          filename: "sbte-logo.png",
          path: "./public/sbte-logo.png",
          cid: "logo",
        },
      ],
    };

    await transporter.sendMail(mailOptions); // Log success with masked email and OTP if present
    console.log(
      `Email sent successfully to ${to.replace(/(.{2}).*(@.*)/, "$1***$2")}${
        data?.otp ? ` with OTP: ${data.otp}` : ""
      }`
    );
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
