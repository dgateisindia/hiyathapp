import "dotenv/config";
import mongoose from "mongoose";
import XLSX from "xlsx";
import Product from "../models/Products"; // Change path if needed

async function updatePrices() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI!);

        // Read Excel
        const workbook = XLSX.readFile("E:/internship/ARCADIO Products Specification.xlsx");

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        let updated = 0;

        for (const row of rows) {
            const sku = row["Model/SKU"];
            const price = Number(row["Price"]);

            if (!sku) continue;

            await Product.updateOne(
                { sku: sku.trim() },
                {
                    $set: {
                        price: price
                    }
                }
            );

            updated++;

            console.log(`${sku} -> ₹${price}`);
        }

        console.log(`Updated ${updated} products`);

        await mongoose.disconnect();

    } catch (err) {
        console.error(err);
    }
}

updatePrices();