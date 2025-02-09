import express from 'express';
import cors from 'cors';
import path from 'path';
import colors from "colors";
import bodyParser from 'body-parser';

import database, { databaseConnection } from './configs/database.js';
import { uiRoute, authRoute, userRoute, postRoute, likeRoute, followRoute, messageRoute, commentRoute, tempRoute, emailRoute } from './routes/index.js';
import cleanTempFolder from './routes/temp/clean-up.js'

const app = express();
const PORT = process.env.PORT || 5000;
export const ServerDir = import.meta.dirname;
const friendLinkClient = process.env.FRIEND_LINK_CLIENT;

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`.green.bold));

//Database Connection
databaseConnection();

app.use(cors({
    origin: friendLinkClient,
    credentials: true
}));

app.use(bodyParser.json());

//Exposing Static Files
app.use(express.static("public"));
app.use('/server/storage/pics', express.static(path.join(ServerDir, 'uploads/pics')));
app.use('/server/storage/posts', express.static(path.join(ServerDir, 'uploads/posts')));
app.use('/server/storage/temp', express.static(path.join(ServerDir, 'uploads/temp')));

//Auth Routes
app.use('/auth', authRoute);

//Ui Routes
app.use('/ui', uiRoute);

//Common Routes
app.use('/user', userRoute);
app.use('/post', postRoute);
app.use('/like', likeRoute);
app.use('/follow', followRoute);
app.use('/comment', commentRoute);
app.use('/message', messageRoute);

app.use('/email', emailRoute);

//Temp Routes
app.use('/temp', tempRoute);
cleanTempFolder();