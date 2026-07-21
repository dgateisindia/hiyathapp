"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const productController_2 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const upload_1 = __importDefault(require("../middleware/upload"));
const multer_1 = __importDefault(require("multer"));
const ProductRouter = express_1.default.Router();
// To upload csv file
const csvUpload = (0, multer_1.default)({
    dest: "uploads/"
});
// Get all products
ProductRouter.get('/', productController_1.getProducts);
// Search products
ProductRouter.get("/search", productController_1.searchProducts);
// Rate product
ProductRouter.post('/:id/rating', upload_1.default.array('images', 5), productController_1.rateProduct);
ProductRouter.get('/:id/my-rating', productController_1.getMyProductRating);
// Get single product
ProductRouter.get('/:id', productController_1.getProduct);
// Create product (admin only)
ProductRouter.post('/', upload_1.default.array('images', 5), auth_1.protect, (0, auth_1.authorize)('admin'), productController_2.createProduct);
// Update product (admin only) 
ProductRouter.put('/:id', upload_1.default.array('images', 5), auth_1.protect, (0, auth_1.authorize)('admin'), productController_1.updateProduct);
// Delete product (admin only) 
ProductRouter.delete('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), productController_1.deleteProduct);
ProductRouter.post("/import-csv", csvUpload.single("file"), productController_1.importProductsCSV);
ProductRouter.post("/import", csvUpload.single("file"), productController_1.importProducts);
exports.default = ProductRouter;
