import express from "express";
import colors from "colors";
import database from "../../configs/database.js";
import { authenticateToken } from '../../middleware/index.js'

const uiRoute = express.Router();

uiRoute
    .get('/feed', authenticateToken, async (req, res) => {
        const userId = req.user;

        //Filtering Feed For Specific User
        try {
            const sql =
                'SELECT p.*, u.name, u.profile_pic, COALESCE(COUNT(l.userId), 0) AS likes, COALESCE(COUNT(c.commentId), 0) AS comments, EXISTS ( SELECT 1 FROM likes l2 WHERE l2.postId = p.postId AND l2.userId = ? ) AS liked FROM posts p JOIN follows f ON p.userId = f.following JOIN user_profile u ON u.userId = f.following LEFT JOIN likes l ON l.postId = p.postId LEFT JOIN comments c ON c.postId = p.postId WHERE f.follower = ? GROUP BY p.postId, u.userId';
            const [response] = await database.execute(sql, [userId, userId]);

            const feedData = response.filter((post) => filterDateInRange(post.created, 120));

            if (!feedData[0]) return res.status(404).send('No New Feed');
            res.send(feedData);

        } catch (err) {
            console.log('Error : Get/ui/feed'.red, err);
            res.status(500).send('Server Error');
        }
    })
    .get('/explore', authenticateToken, async (req, res) => {
        const userId = req.user;
        //Random Post For Explore
        try {
            const sql =
                'SELECT p.*, u.name, u.profile_pic, COUNT(DISTINCT l.likeId) AS likes, COUNT(DISTINCT c.commentId) AS comments, EXISTS ( SELECT 1 FROM likes l2 WHERE l2.postId = p.postId AND l2.userId = ? ) AS liked FROM posts p LEFT JOIN user_profile u ON p.userId = u.userId LEFT JOIN likes l ON p.postId = l.postId LEFT JOIN comments c ON p.postId = c.postId GROUP BY p.postId ORDER BY RAND() LIMIT 21';
            const [response] = await database.execute(sql, [userId]);

            if (!response[0]) return res.status(404).send('No New Explore For User');
            res.send(response);

        } catch (err) {
            console.log('Error : Get/ui/explore'.red, err);
            res.status(500).send('Server Error');
        }
    })
    .get('/reels', authenticateToken, async (req, res) => {
        const userId = req.user;
        //Random Post For Explore
        try {
            const sql =
                'SELECT p.*, u.name, u.profile_pic, COUNT(DISTINCT l.likeId) AS likes, COUNT(DISTINCT c.commentId) AS comments, EXISTS ( SELECT 1 FROM likes l2 WHERE l2.postId = p.postId AND l2.userId = ? ) AS liked FROM posts p LEFT JOIN user_profile u ON p.userId = u.userId LEFT JOIN likes l ON p.postId = l.postId LEFT JOIN comments c ON p.postId = c.postId WHERE p.type = "video" GROUP BY p.postId ORDER BY RAND() LIMIT 11';
            const [response] = await database.execute(sql, [userId]);

            if (!response[0]) return res.status(404).send('No New Explore For User');
            res.send(response);

        } catch (err) {
            console.log('Error : Get/ui/reels'.red, err);
            res.status(500).send('Server Error');
        }
    })

export default uiRoute;

//Compare Date For Filter Post In Given Range
const filterDateInRange = (date, range) => {
    const initDate = date.toISOString().split('T')[0]

    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - range);
    const rangeDate = formatDate(currentDate);

    return initDate > rangeDate;

    function formatDate(date) {
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}