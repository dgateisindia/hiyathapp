import "dotenv/config";

import mongoose from "mongoose";
import fsExtra from "fs-extra";

import cloudinary from "../config/cloudinary";
import Product from "../models/Products"; // Adjust path if needed

async function syncImages() {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);

    const skuFolderMap = await fsExtra.readJson("./sku-folder-map.json");

    for (const [sku, folder] of Object.entries(skuFolderMap)) {
        console.log(`Processing ${sku}`);

        try {
            const result = await cloudinary.search
                .expression(`folder="${folder}"`)
                .sort_by("public_id", "asc")
                .max_results(100)
                .execute();

            const imageUrls = result.resources.map(
                (resource: any) => resource.secure_url
            );

            await Product.updateOne(
                { sku },
                {
                    $set: {
                        images: imageUrls,
                    },
                }
            );

            console.log(`✔ Updated ${sku} (${imageUrls.length} images)`);
        } catch (err) {
            console.error(`✖ Failed ${sku}`);
            console.error(err);
        }
    }

    console.log("✅ All products updated.");

    await mongoose.disconnect();
}

syncImages();