import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

const startServer = async () => {
    try {
        // connect to mongodb
        await connectDB();

        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });

    } catch (error) {
        console.log("Database connection failed", error);
    }
};

startServer();