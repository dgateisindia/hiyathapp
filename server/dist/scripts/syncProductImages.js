"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const Products_1 = __importDefault(require("../models/Products")); // Adjust path if needed
async function syncImages() {
    // Connect to MongoDB
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    const skuFolderMap = await fs_extra_1.default.readJson("./sku-folder-map.json");
    for (const [sku, folder] of Object.entries(skuFolderMap)) {
        console.log(`Processing ${sku}`);
        try {
            const result = await cloudinary_1.default.search
                .expression(`folder="${folder}"`)
                .sort_by("public_id", "asc")
                .max_results(100)
                .execute();
            const imageUrls = result.resources.map((resource) => resource.secure_url);
            await Products_1.default.updateOne({ sku }, {
                $set: {
                    images: imageUrls,
                },
            });
            console.log(`✔ Updated ${sku} (${imageUrls.length} images)`);
        }
        catch (err) {
            console.error(`✖ Failed ${sku}`);
            console.error(err);
        }
    }
    console.log("✅ All products updated.");
    await mongoose_1.default.disconnect();
}
syncImages();
