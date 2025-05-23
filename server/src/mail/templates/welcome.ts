export const welcomeEmailTemplate = (firstName: string) => `
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://wisestyle.com/logo.png" alt="WiseStyle Logo" class="logo">
        </div>
        <div class="content">
            <h1>Welcome to WiseStyle, ${firstName}!</h1>
            <p>We're thrilled to have you join our community of fashion enthusiasts. At WiseStyle, we're committed to bringing you the latest trends and timeless classics.</p>
            <p>Here's what you can do now:</p>
            <ul>
                <li>Complete your profile</li>
                <li>Browse our latest collections</li>
                <li>Save your favorite items</li>
                <li>Start shopping!</li>
            </ul>
            <a href="https://wisestyle.com/shop" class="button">Start Shopping</a>
        </div>
        <div class="footer">
            <p>© 2024 WiseStyle. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`; 