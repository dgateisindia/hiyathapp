"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const xlsx_1 = __importDefault(require("xlsx"));
const Products_1 = __importDefault(require("../models/Products")); // Change path if needed
async function updatePrices() {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        // Read Excel
        const workbook = xlsx_1.default.readFile("E:/internship/ARCADIO Products Specification.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx_1.default.utils.sheet_to_json(sheet);
        let updated = 0;
        for (const row of rows) {
            const sku = row["Model/SKU"];
            const price = Number(row["Price"]);
            if (!sku)
                continue;
            await Products_1.default.updateOne({ sku: sku.trim() }, {
                $set: {
                    price: price
                }
            });
            updated++;
            console.log(`${sku} -> ₹${price}`);
        }
        console.log(`Updated ${updated} products`);
        await mongoose_1.default.disconnect();
    }
    catch (err) {
        console.error(err);
    }
}
updatePrices();
