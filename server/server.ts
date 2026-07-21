import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import connectDB from "./config/db";
import { clerkWebhook } from "./controllers/webhooks";
import makeAdmin from "./scripts/makeAdmin";

import ProductRouter from "./routes/productsRoutes";
import CartRouter from "./routes/cartRoutes";
import OrderRouter from "./routes/orderRoutes";
import AddressRouter from "./routes/addressRoutes";
import AdminRouter from "./routes/adminRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";

// Create Express application first
const app = express();

const port = Number(process.env.PORT) || 5000;

// Required when running behind Nginx or AWS load balancer
app.set("trust proxy", 1);

// General middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

/*
 Clerk webhook must receive the raw request body.
 Therefore, this route must be placed before express.json().
*/
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook
);

// JSON body parser for remaining routes
app.use(express.json());

// Clerk authentication middleware
app.use(clerkMiddleware());

// Basic routes
app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("Server is Live!");
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "hiyath-api",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/products", ProductRouter);
app.use("/api/cart", CartRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/addresses", AddressRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/wishlist", wishlistRoutes);

// Handle unknown endpoints
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    // Make the configured user an admin
    await makeAdmin();

    // Uncomment only when you intentionally want to seed products
    // await seedProducts(process.env.MONGODB_URI as string);

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();