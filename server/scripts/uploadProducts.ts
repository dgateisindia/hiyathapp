import "dotenv/config";

import mongoose from "mongoose";
import XLSX from "xlsx";
import path from "path";

import Product from "../models/Products";

const FILE_PATH =
    "E:/internship/ARCADIO Products Specification.xlsx";
// OR
// const FILE_PATH = "E:/internship/products.csv";

async function uploadProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);

        console.log("✅ Connected to MongoDB");

        const workbook = XLSX.readFile(FILE_PATH);

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows: any[] = XLSX.utils.sheet_to_json(sheet, {
            defval: "",
        });

        let inserted = 0;
        let skipped = 0;

        for (const row of rows) {
            try {
                //---------------------------------------------------
                // SKU
                //---------------------------------------------------
                const sku =
                    row["SKU"] ||
                    row["Sku"] ||
                    row["sku"] ||
                    "";

                if (!sku) {
                    console.log("Skipping row without SKU");
                    continue;
                }

                //---------------------------------------------------
                // Duplicate check
                //---------------------------------------------------
                const exists = await Product.exists({ sku });

                if (exists) {
                    skipped++;
                    console.log(`⏩ ${sku} already exists`);
                    continue;
                }

                //---------------------------------------------------
                // Product Name
                //---------------------------------------------------
                const name =
                    row["Name"] ||
                    row["Product Name"] ||
                    row["PRODUCT NAME"] ||
                    sku;

                //---------------------------------------------------
                // Description
                //---------------------------------------------------
                const description =
                    row["Description"] ||
                    row["DESCRIPTION"] ||
                    "";

                //---------------------------------------------------
                // Category
                //---------------------------------------------------
                const category =
                    row["Category"] ||
                    row["CATEGORY"] ||
                    "Other";

                //---------------------------------------------------
                // Price
                //---------------------------------------------------
                const price = Number(
                    row["Price"] ||
                    row["PRICE"] ||
                    0
                );

                //---------------------------------------------------
                // Compare Price
                //---------------------------------------------------
                const comparePrice = Number(
                    row["Compare Price"] ||
                    row["MRP"] ||
                    row["COMPARE PRICE"] ||
                    0
                );

                //---------------------------------------------------
                // Stock
                //---------------------------------------------------
                const stock = Number(
                    row["Stock"] ||
                    row["STOCK"] ||
                    20
                );

                //---------------------------------------------------
                // Sizes
                //---------------------------------------------------
                let sizes: string[] = [];

                if (row["Sizes"]) {
                    sizes = String(row["Sizes"])
                        .split(",")
                        .map((x: string) => x.trim())
                        .filter(Boolean);
                }

                //---------------------------------------------------
                // Specifications
                //---------------------------------------------------
                const specifications: Record<string, string> = {};

                //---------------------------------------------------
                // Highlights
                //---------------------------------------------------
                const highlights: Record<string, string> = {};

                //---------------------------------------------------
                // Create Product
                //---------------------------------------------------
                await Product.create({
                    sku,
                    name,
                    title: name,
                    description,
                    category,
                    price,
                    comparePrice,
                    stock,

                    images: [],

                    sizes,

                    specifications,

                    highlights,

                    ratings: {
                        average: 0,
                        count: 0,
                    },

                    isFeatured: false,
                    isActive: true,
                });

                inserted++;

                console.log(`✔ ${sku}`);
            } catch (err) {
                console.log(`❌ Error inserting ${row["SKU"]}`);
                console.error(err);
            }
        }

        console.log("\n===============================");
        console.log(`Inserted : ${inserted}`);
        console.log(`Skipped  : ${skipped}`);
        console.log("===============================");

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

uploadProducts();