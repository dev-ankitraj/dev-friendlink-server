import express from 'express';
import nodemailer from 'nodemailer';
import { otpTemplate, welcomeTemplate } from '../../Template/email.js';

const emailRoute = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com', // Gmail SMTP server 
    port: 465, // Port for SSL 
    // port: 587, // Port for TSL 
    secure: true,
    auth: {
        user: process.env.FRIEND_LINK_EMAIL,
        pass: process.env.FRIEND_LINK_EMAIL_PASS, // Use an App Password for Gmail
    },
});

// Function to send an email with retry logic
const sendEmail = async (mailOptions, res, retries = 3) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Message sent: ${info.response}`);
        return info;
    } catch (error) {
        if (retries > 0) {
            console.error(`Failed to send email. Retrying... ${retries} attempts left.`);
            setTimeout(() => sendEmail(mailOptions, res, retries - 1), 1000); // Retry after 1 second
        } else {
            console.error(`Failed to send email after multiple attempts: ${error.message}`);
            res.status(500).send('Failed to send email');
            throw error;
        }
    }
};

emailRoute.post('/verification', async (req, res) => {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);
    const mailOptions = {
        from: `"FriendLink" <${process.env.FRIEND_LINK_EMAIL}>`,
        to: email,
        subject: 'Email Verification',
        html: otpTemplate(otp),
    };

    try {
        await sendEmail(mailOptions, res);
        res.send({ email, message: 'Verification code sent to your email!', code: otp });
    } catch (error) {
        console.error('Verification email error:', error);
    }
})
    .post('/welcome', async (req, res) => {
        const { email, userName } = req.body;

        const mailOptions = {
            from: `"FriendLink" <${process.env.FRIEND_LINK_EMAIL}>`,
            to: email,
            subject: 'Welcome to FriendLink!',
            html: welcomeTemplate(userName), // Use the welcome template 
        };

        try {
            await sendEmail(mailOptions, res);
            res.send('Welcome email sent!');
        } catch (error) {
            console.error('Welcome email error:', error);
        }
    })
    .post('/alert-change', async (req, res) => {
        const { email, userName, changeType, changeDate } = req.body;

        const mailOptions = {
            from: `"FriendLink" <${process.env.FRIEND_LINK_EMAIL}>`,
            to: email,
            subject: `${changeType} Change Notification`,
            html: alertChangeTemplate(userName, changeType, changeDate),
        };

        try {
            await sendEmail(mailOptions, res);
            res.send(`Alert email for ${changeType} sent successfully!`);
        } catch (error) {
            console.error(`${changeType} change email error:`, error);
        }
    });

export default emailRoute;
