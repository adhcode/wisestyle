export const verifyEmailTemplate = (verificationLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <title>Verify Your Email</title>
</head>
<body>
  <h1>Welcome to WiseStyle!</h1>
  <p>Please click the link below to verify your email address:</p>
  <a href="${verificationLink}">Verify Email</a>
  <p>This link will expire in 24 hours.</p>
</body>
</html>
`; 