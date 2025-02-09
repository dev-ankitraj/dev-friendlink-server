// OTP Verification Email Template
const otpTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
    <title>Email Verification</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 24px;
            color: #333;
            margin-top: 10px;
        }
        .header span{
            color:#ff9900;
        }
        .content {
            font-size: 16px;
            color: #555;
        }
        .otp-box{
            text-align: center;
        }
        .otp {
            display: inline-block;
            background: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Friend<span>Link</span></h2>
            <h1>Email Verification</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Your email verification code is:</p>
            <div class='otp-box'>
                <div class="otp">${otp}</div>
            </div>
            <p>Please enter this code to verify your email address. This code is valid for 10 minutes.</p>
            <p>Thank you for being a part of our community!</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 FriendLink. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Welcome Email Template
const welcomeTemplate = (userName) => `
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to Friend Link</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header img {
            width: 100px;
            height: 100px;
            border-radius: 50%;
        }
        .header h1 {
            font-size: 24px;
            color: #333;
            margin-top: 10px;
        }
        .header span{
            color:#ff9900;
        }
        .content {
            font-size: 16px;
            color: #555;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Friend<span>Link</span>!</h1>
        </div>
        <div class="content">
            <p>Hello ${userName},</p>
            <p>We're excited to have you join our community! FriendLink is a place where you can connect with friends, share your thoughts, and explore new interests.</p>
            <p>We're here to support you every step of the way. If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <p>Thank you for being a part of our journey!</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 FriendLink. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const alertChangeTemplate = (userName, changeType, changeDate) => `
<!DOCTYPE html>
<html>
<head>
    <title>${changeType} Change Notification</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 24px;
            color: #333;
            margin-top: 10px;
        }
        .header span{
            color:#ff9900;
        }
        .content {
            font-size: 16px;
            color: #555;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Account Change Notification</h1>
        </div>
        <div class="content">
            <p>Hello ${userName},</p>
            <p>We wanted to inform you that your ${changeType} was changed on your account.</p>
            <p><strong>Details of the Change:</strong></p>
            <p>Change Type: ${changeType}</p>
            <p>Date and Time of Change: ${changeDate}</p>
            <p>If you did not authorize this change, please contact our support team immediately.</p>
            <p>Thank you for your attention!</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 FriendLink. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export { otpTemplate, welcomeTemplate, alertChangeTemplate };