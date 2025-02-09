import express from "express";
import colors from "colors";
import database from "../../configs/database.js";
import { authenticateToken } from '../../middleware/index.js'

const messageRoute = express.Router();

messageRoute
    .get('/chat/:user2', authenticateToken, async (req, res) => {
        const user1 = req.user; //Primary user
        const { user2 } = req.params;

        //Finding Chat Btw User 1 & 2
        try {
            const sql =
                "SELECT m.* FROM messages m WHERE (m.sender =? AND m.receiver =?) OR (m.sender =? AND m.receiver =?)";
            const [response] = await database.execute(sql, [user1, user2, user2, user1]);

            if (!response) return res.status(404).send(`No Chat Btw ${user1} And ${user2}`);
            res.status(200).send(response);

        } catch (err) {
            console.log('Error : Get/message/chat/:user2'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .post("/create", authenticateToken, async (req, res) => {
        const sender = req.user; //Primary user
        const {
            message, receiver
        } = req.body;

        //Creating New Message
        try {
            const sqlCreMessage =
                "INSERT INTO messages(message, sender, receiver) VALUES (?,?,?)";

            const [resCreMessage] = await database.execute(sqlCreMessage, [
                message, sender, receiver
            ]);

            if (!resCreMessage) return res.status(500).send('Message Creation Failed');
            res.send({ messages: "Message Created", messageId: resCreMessage.insertId });

        } catch (err) {
            console.log('Error : Post/message/create'.red, err);
            res.status(500).send("Server Error");
        }
    })
    .delete("/delete/:messageId", authenticateToken, async (req, res) => {
        const { messageId } = req.params;

        //Deleting Message
        try {
            const sql = "DELETE FROM messages WHERE messages.messageId=?";
            const [response] = await database.execute(sql, [messageId]);

            if (!response) return res.status(500).send('Message Deletion Failed');
            res.send(`Message ${messageId} Deleted SuccessFully`);

        } catch (err) {
            console.log('Error : Delete/message/delete/:messageId'.red, err);
            res.status(500).send("Server Error");
        }
    })

export default messageRoute;