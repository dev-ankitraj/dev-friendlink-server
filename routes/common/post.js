import express from "express";
import colors from "colors";
import fs from 'fs/promises';
import path from 'path';
import { ServerDir } from '../../index.js';
import database from "../../configs/database.js";
import { uploadUserPost } from '../../configs/storage.js'
import { authenticateToken } from '../../middleware/index.js'

const postRoute = express.Router();

postRoute
    .get('/:postId', authenticateToken, async (req, res) => {
        const userId = req.user;
        const { postId } = req.params;

        //Finding Post
        try {
            const sql = "SELECT p.*, u.name, u.profile_pic, COUNT(l.likeId) AS likes, COUNT(c.commentId) AS comments, EXISTS ( SELECT 1 FROM likes l2 WHERE l2.postId = p.postId AND l2.userId = ? ) AS liked FROM posts p LEFT JOIN user_profile u ON p.userId = u.userId LEFT JOIN likes l ON p.postId = l.postId LEFT JOIN comments c ON p.postId = c.postId WHERE p.postId = ?";
            const [response] = await database.execute(sql, [userId, postId]);

            if (!response[0]) return res.status(404).send('Post Not Found');
            const postData = response[0];
            res.status(200).send(postData);

        } catch (err) {
            console.log('Error : Get/post/:postId'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .post("/create", authenticateToken, uploadUserPost.single('media'), async (req, res) => {
        const userId = req.user;

        const {
            type, caption, location
        } = req.body;

        const media = req.file ? req.file.filename : null;

        //Creating New Post
        try {
            const sqlCrePost =
                "INSERT INTO posts(userId, media, type, caption, location) VALUES (?,?,?,?,?)";

            const [resCrePost] = await database.execute(sqlCrePost, [
                userId, media, type, caption, location
            ]);

            if (!resCrePost) return res.status(404).send('Post Creation Failed');
            res.send({ messages: "Post Created", postId: resCrePost.insertId });

        } catch (err) {
            console.log('Error : Post/post/create'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .delete("/delete/:postId", authenticateToken, async (req, res) => {
        const { postId } = req.params;

        //Checking Post
        try {
            const sqlPost = "SELECT * FROM posts WHERE postId=?";
            const [resPost] = await database.execute(sqlPost, [postId]);

            if (!resPost[0]) return res.status(404).send('Post Not Found');

            //Delete Post From Server 
            try {
                fs.unlink(path.join(`${ServerDir}/uploads/posts/`, resPost[0].media))
            } catch (err) {
                console.log("Error : Delete/post/delete/:postId, Post Deletion: ", err);
            }

            const sql = "DELETE FROM posts WHERE posts.postId =?";
            const [response] = await database.execute(sql, [postId]);

            if (!response) return res.status(500).send('Post Deletion Failed');
            res.send(`Post ${postId} Deleted SuccessFully`);

        } catch (err) {
            console.log('Error : Delete/post/delete/:postId'.red, err);
            res.status(500).send("Server Error");
        }
    })

export default postRoute;