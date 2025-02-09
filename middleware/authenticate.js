import express from 'express';
import jwt from 'jsonwebtoken';

const jwtSecretKey = process.env.JWT_SECRET_KEY;

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];

    try {
        //Checking Token
        if (!token) return res.status(401).send('Access Denied');
        //Verify Token
        jwt.verify(token, jwtSecretKey, (err, decoded) => {
            if (err) res.status(400).send("Invalid Token");
            const userId = decoded?.userId;
            req.user = userId;
        });
        next();
    } catch (err) {
        console.log('Error : Middleware/authenticateToken'.red, err);
        res.status(500).send("Server Error");
    }
};

export default authenticateToken;
