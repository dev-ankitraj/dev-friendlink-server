import express from "express";
import colors from "colors";
import database from "../../configs/database.js";
import { authenticateToken } from '../../middleware/index.js'

const commentRoute = express.Router();

commentRoute
    .get('/post/:postId', authenticateToken, async (req, res) => {
        const userId = req.user;
        const { postId } = req.params;

        //Finding Comment Of Specific Post
        try {
            const sql = "SELECT c.*, u.*, EXISTS (SELECT 1 FROM likes l WHERE l.commentId = c.commentId AND l.userId = ?) AS liked FROM comments c JOIN user_profile u ON u.userId = c.userId WHERE c.postId = ?";
            const [response] = await database.execute(sql, [userId, postId]);

            if (!response) return res.status(404).send(`Post ${postId} Have No Comment`);
            res.status(200).send(response);

        } catch (err) {
            console.log('Error : Get/comment/post/:postId'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .post("/create", authenticateToken, async (req, res) => {
        const userId = req.user;
        const {
            postId, comment
        } = req.body;

        //Creating New Comment
        try {
            const sqlCreComment =
                "INSERT INTO comments(userId, postId, comment) VALUES (?,?,?)";

            const [resCreComment] = await database.execute(sqlCreComment, [
                userId, postId, comment
            ]);

            if (!resCreComment) return res.status(500).send('Comment Creation Failed');
            res.send({ messages: "Comment Created", commentId: resCreComment.insertId });

        } catch (err) {
            console.log('Error : Post/comment/create'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .delete("/delete/:commentId", authenticateToken, async (req, res) => {
        const { commentId } = req.params;

        //Deleting Comment
        try {
            const sql = "DELETE FROM comments WHERE comments.commentId=?";
            const [response] = await database.execute(sql, [commentId]);

            if (!response) return res.status(500).send('Comment Deletion Failed');
            res.send(`Comment ${commentId} Deleted SuccessFully`);

        } catch (err) {
            console.log('Error : Delete/comment/delete/:commentId'.red, err);
            res.status(500).send("Server Error");
        }
    })

export default commentRoute;