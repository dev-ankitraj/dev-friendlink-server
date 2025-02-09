import express from "express";
import colors from "colors";
import database from "../../configs/database.js";
import { authenticateToken } from '../../middleware/index.js'

const followRoute = express.Router();

followRoute
    .get('/followers', authenticateToken, async (req, res) => {
        const userId = req.user;

        //Finding Followers Of Specific User
        try {
            const sql = "SELECT u.* FROM follows f JOIN user_profile u ON f.follower = u.userId WHERE f.following = ?"
            const [response] = await database.execute(sql, [userId]);

            if (!response) return res.status(404).send(`User ${userId} Have No Followers`);
            res.status(200).send(response);

        } catch (err) {
            console.log('Error : Get/follow/followers'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .get('/followings', authenticateToken, async (req, res) => {
        const userId = req.user;

        //Finding Followings Of Specific User
        try {
            const sql = "SELECT u.* FROM follows f JOIN user_profile u ON f.following = u.userId WHERE f.follower = ?"
            const [response] = await database.execute(sql, [userId]);

            if (!response) return res.status(404).send(`User ${userId} Not Followings AnyOne`);
            res.status(200).send(response);

        } catch (err) {
            console.log('Error : Get/follow/followings'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .post("/create", authenticateToken, async (req, res) => {
        const follower = req.user; //Primary user
        const { following } = req.body;

        //Creating New Follow
        try {
            const sqlCreFollow =
                "INSERT INTO follows(follower, following) VALUES (?,?)";

            const [resCreFollow] = await database.execute(sqlCreFollow, [
                follower, following
            ]);

            if (!resCreFollow) return res.status(500).send('Follow Creation Failed');
            res.send({ messages: "Follow Created", followId: resCreFollow.insertId });

        } catch (err) {
            console.log('Error : Post/follow/create'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .delete("/delete/:followId", authenticateToken, async (req, res) => {
        const { followId } = req.params;

        //Deleting Follow
        try {
            const sql = "DELETE FROM follows WHERE follows.followId=?";
            const [response] = await database.execute(sql, [followId]);

            if (!response) return res.status(500).send('Follow Deletion Failed');
            res.send(`Follow ${followId} Deleted SuccessFully`);

        } catch (err) {
            console.log('Error : Delete/follow/delete/:followId'.red, err);
            res.status(500).send("Server Error");
        }
    })

export default followRoute;