"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wishlistController_1 = require("../controllers/wishlistController");
const router = express_1.default.Router();
router.get("/", wishlistController_1.getWishlist);
router.post("/add", wishlistController_1.addToWishlist);
router.delete("/:productId", wishlistController_1.removeFromWishlist);
router.delete("/", wishlistController_1.clearWishlist);
exports.default = router;
