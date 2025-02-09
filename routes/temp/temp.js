import express from "express";
import colors from "colors";
import { uploadTempFile } from '../../configs/storage.js'

const tempRoute = express.Router();

tempRoute
    .put("/file/upload", uploadTempFile.single("temp"), (req, res) => {
        try {
            if (!req.file.filename) return res.status(500).send('Temp File Upload Failed');
            res.send(req.file.filename);

        } catch (err) {
            console.log('Error : Put/temp/file/upload'.red, err);
            res.status(500).send("Server Error");
        }
    })


export default tempRoute;