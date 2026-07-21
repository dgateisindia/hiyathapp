import "dotenv/config";

import path from "path";
import fs from "fs";
import fsExtra from "fs-extra";
import cloudinary from "../config/cloudinary";

const ROOT_FOLDER =
    "C:/Users/abdul/Downloads/ARCADIO Product Images";

const skuFolderMap: Record<string, string> = {};

const IMAGE_REGEX = /\.(jpg|jpeg|png|webp)$/i;

async function uploadImagesFromSkuFolder(
    sku: string,
    skuPath: string,
    cloudinaryFolder: string
) {
    skuFolderMap[sku] = cloudinaryFolder;

    const files = fs.readdirSync(skuPath);

    for (const file of files) {
        const filePath = path.join(skuPath, file);

        // Ignore folders like AMAZON, Myntra, C1, C4...
        if (!fs.statSync(filePath).isFile()) continue;

        // Ignore non-image files
        if (!IMAGE_REGEX.test(file)) continue;

        try {
            await cloudinary.uploader.upload(filePath, {
                folder: cloudinaryFolder,
                resource_type: "image",
            });

            console.log(`      ✔ ${file}`);
        } catch (err) {
            console.log(`      ✖ ${file}`);
            console.log(err);
        }
    }
}

async function upload() {
    const categories = fs.readdirSync(ROOT_FOLDER);

    for (const category of categories) {
        const categoryPath = path.join(ROOT_FOLDER, category);

        if (!fs.statSync(categoryPath).isDirectory()) continue;

        console.log(`\n========== ${category} ==========`);

        // -------------------------
        // Leather Bags
        // -------------------------
        if (category === "Leather Bags") {
            const subCategories = fs.readdirSync(categoryPath);

            for (const subCategory of subCategories) {
                const subCategoryPath = path.join(categoryPath, subCategory);

                if (!fs.statSync(subCategoryPath).isDirectory()) continue;

                console.log(`\nSubcategory: ${subCategory}`);

                const skuFolders = fs.readdirSync(subCategoryPath);

                for (const sku of skuFolders) {
                    const skuPath = path.join(subCategoryPath, sku);

                    if (!fs.statSync(skuPath).isDirectory()) continue;

                    console.log(`Uploading ${sku}`);

                    const cloudinaryFolder = `products/${category}/${subCategory}/${sku}`;

                    await uploadImagesFromSkuFolder(
                        sku,
                        skuPath,
                        cloudinaryFolder
                    );
                }
            }
        }

        // -------------------------
        // Leather Wallet
        // -------------------------
        else if (category === "Leather wallet") {
            const skuFolders = fs.readdirSync(categoryPath);

            for (const sku of skuFolders) {
                const skuPath = path.join(categoryPath, sku);

                if (!fs.statSync(skuPath).isDirectory()) continue;

                console.log(`Uploading ${sku}`);

                const cloudinaryFolder = `products/${category}/${sku}`;

                await uploadImagesFromSkuFolder(
                    sku,
                    skuPath,
                    cloudinaryFolder
                );
            }
        }

        // -------------------------
        // Sunglass
        // -------------------------
        else if (category === "Sunglass") {
            const skuFolders = fs.readdirSync(categoryPath);

            for (const sku of skuFolders) {
                const skuPath = path.join(categoryPath, sku);

                if (!fs.statSync(skuPath).isDirectory()) continue;

                console.log(`Uploading ${sku}`);

                const cloudinaryFolder = `products/${category}/${sku}`;

                await uploadImagesFromSkuFolder(
                    sku,
                    skuPath,
                    cloudinaryFolder
                );
            }
        }
    }

    await fsExtra.writeJson("./sku-folder-map.json", skuFolderMap, {
        spaces: 2,
    });

    console.log("\n=================================");
    console.log("✅ Upload completed.");
    console.log("✅ SKU map generated.");
}

upload();