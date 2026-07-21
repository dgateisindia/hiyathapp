"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_2 = require("@clerk/express");
const db_1 = __importDefault(require("./config/db"));
const webhooks_1 = require("./controllers/webhooks");
const makeAdmin_1 = __importDefault(require("./scripts/makeAdmin"));
const productsRoutes_1 = __importDefault(require("./routes/productsRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const addressRoutes_1 = __importDefault(require("./routes/addressRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const wishlistRoutes_1 = __importDefault(require("./routes/wishlistRoutes"));
// Create Express application first
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 5000;
// Required when running behind Nginx or AWS load balancer
app.set("trust proxy", 1);
// General middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
}));
/*
 Clerk webhook must receive the raw request body.
 Therefore, this route must be placed before express.json().
*/
app.post("/api/clerk", express_1.default.raw({ type: "application/json" }), webhooks_1.clerkWebhook);
// JSON body parser for remaining routes
app.use(express_1.default.json());
// Clerk authentication middleware
app.use((0, express_2.clerkMiddleware)());
// Basic routes
app.get("/", (_req, res) => {
    res.status(200).send("Server is Live!");
});
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "hiyath-api",
        timestamp: new Date().toISOString(),
    });
});
// API routes
app.use("/api/products", productsRoutes_1.default);
app.use("/api/cart", cartRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/addresses", addressRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/wishlist", wishlistRoutes_1.default);
// Handle unknown endpoints
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
    });
});
const startServer = async () => {
    try {
        await (0, db_1.default)();
        // Make the configured user an admin
        await (0, makeAdmin_1.default)();
        // Uncomment only when you intentionally want to seed products
        // await seedProducts(process.env.MONGODB_URI as string);
        app.listen(port, "0.0.0.0", () => {
            console.log(`Server is running on port ${port}`);
            console.log(`Health check: http://localhost:${port}/health`);
        });
    }
    catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};
startServer();
