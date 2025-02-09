import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const database = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
});

export const databaseConnection = async () => {
    try {
        database.connect();
        console.log("Database is connected".yellow.bold);
    } catch (err) {
        console.log("Failed to connect database".red.bold);
        throw err;
    }
}

export default database; 