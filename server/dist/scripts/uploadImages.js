"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const ROOT_FOLDER = "C:/Users/abdul/Downloads/ARCADIO Product Images";
const skuFolderMap = {};
const IMAGE_REGEX = /\.(jpg|jpeg|png|webp)$/i;
async function uploadImagesFromSkuFolder(sku, skuPath, cloudinaryFolder) {
    skuFolderMap[sku] = cloudinaryFolder;
    const files = fs_1.default.readdirSync(skuPath);
    for (const file of files) {
        const filePath = path_1.default.join(skuPath, file);
        // Ignore folders like AMAZON, Myntra, C1, C4...
        if (!fs_1.default.statSync(filePath).isFile())
            continue;
        // Ignore non-image files
        if (!IMAGE_REGEX.test(file))
            continue;
        try {
            await cloudinary_1.default.uploader.upload(filePath, {
                folder: cloudinaryFolder,
                resource_type: "image",
            });
            console.log(`      ✔ ${file}`);
        }
        catch (err) {
            console.log(`      ✖ ${file}`);
            console.log(err);
        }
    }
}
async function upload() {
    const categories = fs_1.default.readdirSync(ROOT_FOLDER);
    for (const category of categories) {
        const categoryPath = path_1.default.join(ROOT_FOLDER, category);
        if (!fs_1.default.statSync(categoryPath).isDirectory())
            continue;
        console.log(`\n========== ${category} ==========`);
        // -------------------------
        // Leather Bags
        // -------------------------
        if (category === "Leather Bags") {
            const subCategories = fs_1.default.readdirSync(categoryPath);
            for (const subCategory of subCategories) {
                const subCategoryPath = path_1.default.join(categoryPath, subCategory);
                if (!fs_1.default.statSync(subCategoryPath).isDirectory())
                    continue;
                console.log(`\nSubcategory: ${subCategory}`);
                const skuFolders = fs_1.default.readdirSync(subCategoryPath);
                for (const sku of skuFolders) {
                    const skuPath = path_1.default.join(subCategoryPath, sku);
                    if (!fs_1.default.statSync(skuPath).isDirectory())
                        continue;
                    console.log(`Uploading ${sku}`);
                    const cloudinaryFolder = `products/${category}/${subCategory}/${sku}`;
                    await uploadImagesFromSkuFolder(sku, skuPath, cloudinaryFolder);
                }
            }
        }
        // -------------------------
        // Leather Wallet
        // -------------------------
        else if (category === "Leather wallet") {
            const skuFolders = fs_1.default.readdirSync(categoryPath);
            for (const sku of skuFolders) {
                const skuPath = path_1.default.join(categoryPath, sku);
                if (!fs_1.default.statSync(skuPath).isDirectory())
                    continue;
                console.log(`Uploading ${sku}`);
                const cloudinaryFolder = `products/${category}/${sku}`;
                await uploadImagesFromSkuFolder(sku, skuPath, cloudinaryFolder);
            }
        }
        // -------------------------
        // Sunglass
        // -------------------------
        else if (category === "Sunglass") {
            const skuFolders = fs_1.default.readdirSync(categoryPath);
            for (const sku of skuFolders) {
                const skuPath = path_1.default.join(categoryPath, sku);
                if (!fs_1.default.statSync(skuPath).isDirectory())
                    continue;
                console.log(`Uploading ${sku}`);
                const cloudinaryFolder = `products/${category}/${sku}`;
                await uploadImagesFromSkuFolder(sku, skuPath, cloudinaryFolder);
            }
        }
    }
    await fs_extra_1.default.writeJson("./sku-folder-map.json", skuFolderMap, {
        spaces: 2,
    });
    console.log("\n=================================");
    console.log("✅ Upload completed.");
    console.log("✅ SKU map generated.");
}
upload();
