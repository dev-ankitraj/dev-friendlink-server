import express from "express";
import colors from "colors";
import database from "../../configs/database.js";
import { authenticateToken } from '../../middleware/index.js';

const likeRoute = express.Router();

// Route to get likes for a specific post
likeRoute.get('/post/:postId', authenticateToken, async (req, res) => {
    const userId = req.user;
    const { postId } = req.params;

    try {
        const sql = "SELECT * FROM likes WHERE postId=? AND userId=?";
        const [response] = await database.execute(sql, [postId, userId]);

        if (!response.length) return res.status(404).send(`Post ${postId} has no likes`);

        res.status(200).send(response[0]);  // Returning an array of likes for the post

    } catch (err) {
        console.log('Error : Get/like/post/:postId'.red, err);
        res.status(500).send("Server Error");
    }
});

// Route to get likes for a specific comment
likeRoute.get('/comment/:commentId', authenticateToken, async (req, res) => {
    const userId = req.user;
    const { commentId } = req.params;

    try {
        const sql = "SELECT * FROM likes WHERE commentId=? AND userId=?";
        const [response] = await database.execute(sql, [commentId, userId]);

        if (!response.length) return res.status(404).send(`Comment ${commentId} has no likes`);

        res.status(200).send(response[0]);  // Returning an array of likes for the comment

    } catch (err) {
        console.log('Error : Get/like/comment/:commentId'.red, err);
        res.status(500).send("Server Error");
    }
});

likeRoute.post("/create", authenticateToken, async (req, res) => {
    const userId = req.user;
    const { postId, commentId } = req.body;

    // Ensure that either postId or commentId is provided
    if (!postId && !commentId) {
        return res.status(400).send('Either postId or commentId must be provided.');
    }

    // Ensure that the user has not already liked the post or comment
    try {
        const existingLikeSql = "SELECT * FROM likes WHERE userId=? AND (postId=? OR commentId=?)";
        const [existingLikes] = await database.execute(existingLikeSql, [userId, postId || null, commentId || null]);

        if (existingLikes.length > 0) {
            return res.status(400).send('You have already liked this post or comment');
        }

        // Constructing the fields to insert (either postId or commentId)
        const fieldsToUpdate = {};
        if (postId) {
            fieldsToUpdate.postId = postId;
        }

        if (commentId) {
            fieldsToUpdate.commentId = commentId;
        }

        // Constructing SQL for insertion
        const setClause = Object.keys(fieldsToUpdate).concat('userId').join(", ");
        const valuePlaceholders = Object.keys(fieldsToUpdate).map(() => "?").concat('?').join(", ");
        const values = [...Object.values(fieldsToUpdate), userId];

        const sqlUpdate = `INSERT INTO likes (${setClause}) VALUES (${valuePlaceholders})`;
        const [resCreLike] = await database.execute(sqlUpdate, values);

        if (!resCreLike) return res.status(500).send('Like Creation Failed');
        res.status(201).send({ message: "Like Created", likeId: resCreLike.insertId });

    } catch (err) {
        console.log('Error : Post/like/create'.red, err);
        res.status(500).send("Server Error");
    }
});

// Route to delete a like (unlike) by likeId
likeRoute.delete("/delete/:likeId", authenticateToken, async (req, res) => {
    const userId = req.user;
    const { likeId } = req.params;

    try {
        // Check if the like exists and belongs to the current user
        const sqlCheck = "SELECT * FROM likes WHERE likeId=? AND userId=?";
        const [like] = await database.execute(sqlCheck, [likeId, userId]);

        if (!like.length) return res.status(404).send('Like not found or you are not authorized to delete it');

        const sql = "DELETE FROM likes WHERE likeId=?";
        const [response] = await database.execute(sql, [likeId]);

        if (!response.affectedRows) return res.status(500).send('Like Deletion Failed');
        res.send(`Like ${likeId} Deleted Successfully`);

    } catch (err) {
        console.log('Error : Delete/like/delete/:likeId'.red, err);
        res.status(500).send("Server Error");
    }
});

export default likeRoute;
