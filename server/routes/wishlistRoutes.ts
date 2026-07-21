import express from "express";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
} from "../controllers/wishlistController";

const router = express.Router();

router.get("/", getWishlist);

router.post("/add", addToWishlist);

router.delete("/:productId", removeFromWishlist);

router.delete("/", clearWishlist);

export default router;