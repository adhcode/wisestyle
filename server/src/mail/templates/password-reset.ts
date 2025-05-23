export const passwordResetTemplate = (resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; }
        .content { padding: 20px 0; }
        .button { 
            display: inline-block;
            padding: 12px 24px;
            background-color: #4A90E2;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
        }
        .footer { 
            text-align: center;
            padding: 20px 0;
            font-size: 12px;
            color: #666;
        }
        .warning {
            color: #721c24;
            background-color: #f8d7da;
            padding: 10px;
            border-radius: 4px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://wisestyle.com/logo.png" alt="WiseStyle Logo" class="logo">
        </div>
        <div class="content">
            <h1>Reset Your Password</h1>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <div class="warning">
                <p>This link will expire in 1 hour for security reasons.</p>
                <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
        </div>
        <div class="footer">
            <p>© 2024 WiseStyle. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`; 