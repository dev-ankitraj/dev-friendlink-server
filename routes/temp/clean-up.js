import fs from 'fs/promises';
import path from 'path';
import { ServerDir } from '../../index.js';

const cleanTempFolder = () => {
    let tempFiles = 0;
    setInterval(async () => {

        //Accessing All Temp Files
        const files = await fs.readdir(path.join(ServerDir, `uploads/temp/`));
        try {
            files.map((file) => {
                const time = file.split('-');
                const old = parseInt(Date.now()) - parseInt(time[0]);

                //Removing 10 Min Old Files
                if (old >= 600000) {
                    fs.unlink(path.join(`${ServerDir}/uploads/temp/`, file)).then(() => {
                        tempFiles++;
                    })
                }
            })
        } catch (err) {
            console.log("Error On Cleaning Temp: ", err);
        }

        if (files.length == 0 && tempFiles > 0) {
            tempFiles == 1 ?
                console.log(`${tempFiles} File Is Deleted`) :
                console.log(`${tempFiles} Files Are Deleted`);
            console.log('Temp Is Clean');
            tempFiles = 0;
        }

    }, 10000);
}
export default cleanTempFolder;