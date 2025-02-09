import express from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import colors from "colors";
import database from "../../configs/database.js";
import { authenticateToken } from "../../middleware/index.js";

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const authRoute = express.Router();

authRoute
    .post('/login', async (req, res) => {
        const { userId, email, password } = req.body;

        //Finding User
        try {
            const sqlUser = "SELECT * FROM users WHERE userId=? OR email=?";
            const [resUser] = await database.execute(sqlUser, [userId, email]);

            if (!resUser[0]) return res.status(404).send('User Not Found');

            //Matching Password
            const user = resUser[0];
            const isMatch = bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(404).send('Invalid Credentials');

            //Sending Token For Auto Login
            const token = jwt.sign({ userId: userId }, jwtSecretKey, { expiresIn: '5d' });
            res.send({ userId: user.userId, token: token, message: `Login Success: ${user.userId}` });

        } catch (err) {
            console.log('Error : Post/auth/login'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .get('/token/login', authenticateToken, async (req, res) => {
        const userId = req.user;

        if (userId) return res.send({ userId: userId, message: 'Verified' });
    })
    .post('/verify/password', async (req, res) => {
        const { userId, password } = req.body;

        //Finding User
        try {
            const sqlUser = "SELECT * FROM users WHERE userId=?";
            const [resUser] = await database.execute(sqlUser, [userId]);

            if (!resUser[0]) return res.status(404).send('User Not Found');

            //Matching Password
            const user = data[0];
            const isMatch = bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).send('Invalid Password');
            res.send('Verified');

        } catch (err) {
            console.log('Error : Post/auth/verify/password'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .put('/change/password', async (req, res) => {
        const { email, password } = req.body;

        //Generating HashPassword
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        //Creating New User
        try {
            const sql =
                "UPDATE users SET password = ? WHERE email = ?";

            const [response] = await database.execute(sql, [
                hashPassword, email,
            ]);

            if (!response) return res.status(500).send('Password Updating Failed');

            res.status(200).send("Password Updated");
        } catch (err) {
            console.log('Error : Put/auth/change/password'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .put('/change/email', async (req, res) => {
        const { emailOld, emailNew } = req.body;

        //Creating New User
        try {
            const sql =
                "UPDATE users SET email = ? WHERE email = ?";

            const [response] = await database.execute(sql, [
                emailNew, emailOld
            ]);

            if (!response) return res.status(500).send('Email Updating Failed');

            res.status(200).send("Email Updated");
        } catch (err) {
            console.log('Error : Put/auth/change/email'.red, err);
            res.status(500).send("Server Error");
        }
    })

export default authRoute;