export const baseEmailTemplate = (content: string, title: string = 'WiseStyle') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background-color: #ffffff;
            padding: 40px 40px 20px 40px;
            text-align: center;
            border-bottom: 1px solid #e9ecef;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            color: #3B2305;
            text-decoration: none;
            letter-spacing: -0.5px;
        }
        
        .content {
            padding: 40px;
            background-color: #ffffff;
        }
        
        .content h1 {
            color: #3B2305;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        
        .content h2 {
            color: #3B2305;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
            margin-top: 32px;
        }
        
        .content p {
            color: #555555;
            font-size: 16px;
            margin-bottom: 16px;
            line-height: 1.6;
        }
        
        .content ul {
            color: #555555;
            font-size: 16px;
            margin-bottom: 20px;
            padding-left: 20px;
        }
        
        .content li {
            margin-bottom: 8px;
        }
        
        .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #3B2305;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            transition: background-color 0.2s ease;
        }
        
        .button:hover {
            background-color: #4c2d08;
        }
        
        .button-secondary {
            display: inline-block;
            padding: 14px 28px;
            background-color: transparent;
            color: #3B2305 !important;
            text-decoration: none;
            border: 2px solid #3B2305;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
        }
        
        .alert {
            padding: 16px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
        }
        
        .alert-warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
        }
        
        .alert-info {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
        }
        
        .alert-success {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        
        .divider {
            height: 1px;
            background-color: #e9ecef;
            margin: 32px 0;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer p {
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .footer a {
            color: #3B2305;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #6c757d;
            text-decoration: none;
            font-size: 14px;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                box-shadow: none;
            }
            
            .header,
            .content,
            .footer {
                padding: 24px 20px;
            }
            
            .content h1 {
                font-size: 22px;
            }
            
            .button,
            .button-secondary {
                display: block;
                text-align: center;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">WiseStyle</div>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <p><strong>WiseStyle</strong> - Your Style, Your Way</p>
            <p>© ${new Date().getFullYear()} WiseStyle. All rights reserved.</p>
            <p>
                <a href="mailto:hello@wisestyleshop.com">Contact Support</a> | 
                <a href="https://wisestyleshop.com/privacy">Privacy Policy</a> | 
                <a href="https://wisestyleshop.com/terms">Terms of Service</a>
            </p>
            <div class="social-links">
                <a href="https://instagram.com/wisestyle">Instagram</a>
                <a href="https://facebook.com/wisestyle">Facebook</a>
                <a href="https://twitter.com/wisestyle">Twitter</a>
            </div>
        </div>
    </div>
</body>
</html>
`;