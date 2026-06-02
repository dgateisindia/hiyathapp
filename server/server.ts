import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db";
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhook } from "./controllers/webhooks";
import makeAdmin from "./scripts/makeAdmin";
import ProductRouter from "./routes/productsRoutes";

const app = express();

// Middleware
app.use(cors());

//clerk webhook route
app.post('/api/clerk', express.raw({ type: 'application/json' }), clerkWebhook)
app.use(express.json());
app.use(clerkMiddleware())


const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use('/api/products', ProductRouter);

const startServer = async () => {
    try {

        // connect to mongodb
        await connectDB();

        await makeAdmin();

        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });

    } catch (error) {
        console.log("Database connection failed", error);
    }
};

startServer();