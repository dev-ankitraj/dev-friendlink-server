import express from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import colors from "colors";
import fs from 'fs/promises';
import path from 'path';
import { ServerDir } from '../../index.js';
import database from "../../configs/database.js";
import { uploadUserAvatar } from '../../configs/storage.js'
import { authenticateToken } from "../../middleware/index.js";

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const userRoute = express.Router();

userRoute
    .get('/', authenticateToken, async (req, res) => {
        //Finding User
        try {
            const sql = "SELECT * FROM user_profile";
            const [response] = await database.execute(sql);

            if (!response[0]) return res.status(404).send('User Not Found');
            res.status(200).send(response);

        } catch (err) {
            console.log('Error : Get/user'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .put("/profile", authenticateToken, uploadUserAvatar.single("avatar"), async (req, res) => {
        const userId = req.user;
        const { name, bio, dob, link } = req.body;
        const avatar = req.file ? req.file.filename : null;

        try {
            const sqlUser = "SELECT * FROM user_profile WHERE userId=?";
            const [resUser] = await database.execute(sqlUser, [userId]);

            if (resUser.length > 0) {
                // User profile exists, update it
                const fieldsToUpdate = {};
                if (avatar) fieldsToUpdate.profile_pic = avatar;
                if (name) fieldsToUpdate.name = name;
                if (bio) fieldsToUpdate.bio = bio;
                if (dob) fieldsToUpdate.dob = dob;
                if (link) fieldsToUpdate.link = link;

                if (avatar && resUser[0].profile_pic) {
                    try {
                        fs.unlinkSync(path.join(`./uploads/pics/`, resUser[0].profile_pic));
                    } catch (err) {
                        console.log("Error deleting old profile pic:", err);
                    }
                }

                const setClause = Object.keys(fieldsToUpdate)
                    .map(field => `${field}=?`)
                    .join(", ");
                const values = [...Object.values(fieldsToUpdate), userId];

                const sqlUpdate = `UPDATE user_profile SET ${setClause} WHERE userId=?`;
                const [response] = await database.execute(sqlUpdate, values);

                if (!response) return res.status(500).send("User update failed");
                res.send("User profile updated successfully");
            } else {
                // User profile does not exist, create it
                const sqlCreProfile = "INSERT INTO user_profile(userId, name, profile_pic, bio, dob, link) VALUES (?,?,?,?,?,?)";
                const [resCreProfile] = await database.execute(sqlCreProfile, [
                    userId, name, avatar, bio, dob, link
                ]);

                if (!resCreProfile) return res.status(404).send('User profile creation failed');
                res.send({ message: "User profile created successfully" });
            }
        } catch (err) {
            console.log('Error : Put/user/profile'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .get('/profile/:userId', async (req, res) => {
        const { userId } = req.params;

        //Finding User
        try {
            // const sql = "SELECT up.*, u.created FROM user_profile up JOIN users u ON up.userId = u.userId WHERE up.userId = ?";
            const sql = "SELECT up.*, u.created, u.email, COUNT(p.postId) AS posts, COUNT(DISTINCT f.follower) AS follower, COUNT(DISTINCT f2.following) AS following FROM user_profile up JOIN users u ON up.userId = u.userId LEFT JOIN posts p ON up.userId = p.userId LEFT JOIN follows f ON up.userId = f.following LEFT JOIN follows f2 ON up.userId = f2.follower WHERE up.userId = ? GROUP BY up.userId";
            const [response] = await database.execute(sql, [userId]);

            if (!response[0]) return res.status(404).send('User Not Found');
            const userData = response[0];
            res.status(200).send(userData);

        } catch (err) {
            console.log('Error : Get/user/profile/:userId'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .get('/posts', authenticateToken, async (req, res) => {
        const userId = req.user;

        //Finding Post Of Specific User
        try {
            const sql = "SELECT * FROM posts WHERE userId=?";
            const [response] = await database.execute(sql, [userId]);

            if (!response) return res.status(404).send(`User ${userId} Have No Post`);
            res.status(200).send(response);

        } catch (err) {
            console.log('Error : Get/post/user'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .get('/posts/:userId', authenticateToken, async (req, res) => {
        const { userId } = req.params;

        //Finding Post Of Specific User
        try {
            const sql = "SELECT * FROM posts WHERE userId=?";
            const [response] = await database.execute(sql, [userId]);

            if (!response) return res.status(404).send(`User ${userId} Have No Post`);
            res.status(200).send(response);

        } catch (err) {
            console.log('Error : Get/post/user'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .post("/create", async (req, res) => {
        const {
            userId, email, password,
        } = req.body;

        //Generating HashPassword
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        //Creating New User
        try {
            const sql =
                "INSERT INTO users(userId, email, password) VALUES (?,?,?)";

            const [response] = await database.execute(sql, [
                userId, email, hashPassword
            ]);

            if (!response) return res.status(500).send('Account Creation Failed');
            //Generating Token For User Login
            const token = jwt.sign({ userId: userId }, jwtSecretKey, { expiresIn: '21d' });
            res.status(200).send({ userId: userId, token: token, message: "Account Created" });
        } catch (err) {
            console.log('Error : Post/user/create'.red, err);
            res.status(500).send("Server Error");
        }
    })

    .put('/update/status', authenticateToken, async (req, res) => {
        const userId = req.user;
        const { isActive } = req.body;

        //Update User Status
        try {
            const sql = 'UPDATE users SET isActive = ? WHERE userId = ?';
            const [response] = await database.execute(sql, [isActive, userId]);

            if (!response) return res.status(500).send("User Status Updated Failed");
            res.send("User Status Updated");

        } catch (err) {
            console.log('Error : Put/user/update/status'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .get('/friends', authenticateToken, async (req, res) => {
        const userId = req.user;

        // Find Friends Of Specific User
        try {
            const sql =
                'SELECT f1.follower AS userId, u.userName, u.avatar FROM follows f1 JOIN follows f2 ON f1.follower = f2.following LEFT JOIN users u ON u.userId = f2.following WHERE f1.following = ?';
            const [response] = await database.execute(sql, [userId]);

            if (!response[0]) return res.status(404).send(`User ${userId} Have No Friend`);
            res.send(response);

        } catch (err) {
            console.log('Error : Get/user/friends'.red, err);
            res.status(500).send('Server Error');
        }
    })
    .get('/active/friends', authenticateToken, async (req, res) => {
        const userId = req.user;

        //Find Active Friends Of Specific User
        try {
            const sql =
                'SELECT f1.follower AS friend, u.profile_pic AS avatar FROM follows f1 JOIN user_profile u ON u.userId = f1.follower JOIN follows f2 ON f1.follower = f2.following WHERE f1.following =? AND f2.follower =? AND u.isActive=1';

            const [response] = await database.execute(sql, [userId, userId]);

            if (!response[0]) return res.status(404).send(`User ${userId} Have No Active Friend`);
            res.send(response);

        } catch (err) {
            console.log('Error : Get/user/active/friends'.red, err);
            res.status(500).send('Server Error');
        }
    })
    .delete("/delete", authenticateToken, async (req, res) => {
        const userId = req.user;

        //Checking User And Posts
        try {
            const sqlUser = "SELECT * FROM users WHERE userId=?";
            const [resUser] = await database.execute(sqlUser, [userId]);

            const sqlPost = "SELECT * FROM posts WHERE userId=?";
            const [resPost] = await database.execute(sqlPost, [userId]);

            if (!resUser[0]) return res.status(404).send('User Not Found');

            //Delete User Profile Pic From Server
            try {
                fs.unlink(path.join(`${ServerDir}/uploads/pics/`, resUser[0].avatar));
            } catch (err) {
                console.log("Error : Delete/user/delete, Profile Pic Deletion: ", err);
            }

            //Delete User Posts From Server 
            try {
                resPost.map((file) => {
                    fs.unlink(path.join(`${ServerDir}/uploads/posts/`, file.media))
                })
            } catch (err) {
                console.log("Error : Delete/user/delete, Posts Deletion: ", err);
            }

            //Deleting All Data Of User
            const sqlDelUser = "DELETE FROM users WHERE users.userId =?";
            const [resDelUser] = await database.execute(sqlDelUser, [userId]);

            const sqlDelPost = "DELETE FROM posts WHERE posts.userId =?";
            const [resDelPost] = await database.execute(sqlDelPost, [userId]);

            const sqlDelMessage = "DELETE FROM messages WHERE messages.sender =? OR messages.receiver =?";
            const [resDelMessage] = await database.execute(sqlDelMessage, [userId, userId]);

            const sqlDelLike = "DELETE FROM likes WHERE likes.userId =?";
            const [resDelLike] = await database.execute(sqlDelLike, [userId]);

            const sqlDelFollow = "DELETE FROM follows WHERE follows.follower =? OR follows.following =?";
            const [resDelFollow] = await database.execute(sqlDelFollow, [userId, userId]);

            const sqlDelComment = "DELETE FROM comments WHERE comments.userId =?";
            const [resDelComment] = await database.execute(sqlDelComment, [userId]);

            if (resDelUser && resDelPost && resDelLike && resDelMessage && resDelFollow && resDelComment) {
                res.send(`User Account: ${userId} Deleted SuccessFully`);
            }
        } catch (err) {
            console.log('Error : Delete/user/delete'.red, err);
            res.status(500).send("Server Error");
        }
    })

export default userRoute;