import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db";
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhook } from "./controllers/webhooks";
import makeAdmin from "./scripts/makeAdmin";
import ProductRouter from "./routes/productsRoutes";
import CartRouter from "./routes/cartRoutes";
import OrderRouter from "./routes/orderRoutes";
import AddressRouter from "./routes/addressRoutes";
import AdminRouter from "./routes/adminRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import { seedProducts } from "./scripts/seedProducts";

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
app.use('/api/cart', CartRouter);
app.use('/api/orders', OrderRouter)
app.use('/api/addresses', AddressRouter)
app.use('/api/admin', AdminRouter)
app.use("/api/wishlist", wishlistRoutes)




const startServer = async () => {
    try {

        // connect to mongodb
        await connectDB();

        await makeAdmin();

        // seed dummy products if no products are present
        //await seedProducts(process.env.MONGODB_URI as string);


        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });

    } catch (error) {
        console.log("Database connection failed", error);
    }
};

startServer();