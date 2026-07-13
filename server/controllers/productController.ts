import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import Product from '../models/Products';

import fs from "fs";
import csv from "csv-parser";
import XLSX from "xlsx";


// Get all products
// GET /api/products
export const getProducts = async (
    req: Request,
    res: Response
) => {
    try {
        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.max(
            Number(req.query.limit) || 10,
            1
        );

        const sort = String(
            req.query.sort || "default"
        );

        const query: any = {
            isActive: true
        };

        let sortOptions: Record<string, 1 | -1>;

        if (sort === "lowToHigh") {
            sortOptions = {
                price: 1,
                _id: 1
            };
        } else if (sort === "highToLow") {
            sortOptions = {
                price: -1,
                _id: 1
            };
        } else {
            sortOptions = {
                createdAt: -1,
                _id: -1
            };
        }

        const total = await Product.countDocuments(query);

        const products = await Product.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search products by name 

export const searchProducts = async (
    req: Request,
    res: Response
) => {
    try {

        const q = String(req.query.q || '');
        const sort = String(
            req.query.sort || 'default'
        );

        const filter: any = {
            isActive: true
        };

        if (q.trim()) {
            filter.$or = [
                {
                    title: {
                        $regex: q,
                        $options: 'i'
                    }
                },
                {
                    name: {
                        $regex: q,
                        $options: 'i'
                    }
                },
                {
                    description: {
                        $regex: q,
                        $options: 'i'
                    }
                },
                {
                    category: {
                        $regex: q,
                        $options: 'i'
                    }
                }
            ];
        }

        const sortOptions: Record<string, 1 | -1> =
            sort === 'lowToHigh'
                ? {
                    price: 1,
                    _id: 1
                }
                : sort === 'highToLow'
                    ? {
                        price: -1,
                        _id: 1
                    }
                    : {
                        createdAt: -1,
                        _id: -1
                    };

        const products = await Product.find(filter)
            .sort(sortOptions);

        res.json({
            success: true,
            data: products
        });

    } catch (error: any) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get single product 
// GET /api/products/:id

export const getProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }


        res.json({ success: true, data: product });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }

}

// Create a new product
// POST /api/products

export const createProduct = async (req: Request, res: Response) => {
    try {
        let images: string[] = [];

        // const files = req.files as any[];
        const files = (req as any).files;

        // Handle file uploads
        if (files && files.length > 0) {

            const uploadPromises = files.map((file: any) => {
                return new Promise<string>((resolve, reject) => {
                    const uploadStream =
                        cloudinary.uploader.upload_stream(
                            { folder: 'ecom-app/products' },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result?.secure_url || '');
                            }
                        );

                    uploadStream.end(file.buffer);
                });
            });

            images = await Promise.all(uploadPromises);
        }

        let sizes = req.body.sizes || [];

        if (typeof sizes === 'string') {
            try {
                sizes = JSON.parse(sizes);
            } catch {
                sizes = sizes
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter((s: string) => s !== '');
            }
        }

        if (!Array.isArray(sizes)) {
            sizes = [sizes];
        }

        if (images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one image is required'
            });
        }

        const productData = {
            ...req.body,
            images,
            sizes
        };

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            data: product
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update a product
// PUT /api/products/:id



export const updateProduct = async (req: Request, res: Response) => {
    try {



        let images: string[] = [];

        const files = (req as any).files;

        // Existing images
        if (req.body.existingImages) {
            if (Array.isArray(req.body.existingImages)) {
                images = [...req.body.existingImages];
            } else {
                images = [req.body.existingImages];
            }
        }

        // Upload new images
        if (files && files.length > 0) {
            const uploadPromises = files.map((file: any) => {
                return new Promise<string>((resolve, reject) => {
                    const uploadStream =
                        cloudinary.uploader.upload_stream(
                            { folder: 'ecom-app/products' },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result?.secure_url || '');
                            }
                        );

                    uploadStream.end(file.buffer);
                });
            });

            const newImages = await Promise.all(uploadPromises);
            images = [...images, ...newImages];
        }

        const updates: any = { ...req.body };

        // Handle sizes
        if (req.body.sizes) {
            let sizes = req.body.sizes;

            if (typeof sizes === 'string') {
                try {
                    sizes = JSON.parse(sizes);
                } catch {
                    sizes = sizes
                        .split(',')
                        .map((s: string) => s.trim())
                        .filter((s: string) => s !== '');
                }
            }

            if (!Array.isArray(sizes)) {
                sizes = [sizes];
            }

            updates.sizes = sizes;
        }

        // Update images if provided
        if (
            req.body.existingImages ||
            (files && files.length > 0)
        ) {
            updates.images = images;
        }

        delete updates.existingImages;



        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a product
// DELETE /api/products/:id

export const deleteProduct = async (req: Request, res: Response) => {
    try {

        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });

        }
        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            const deletePromises = product.images.map((imageUrl: string) => {
                const publicIdMatch = imageUrl.match(/\/([^\/]+)\.[a-zA-Z]+$/);
                const publicId = publicIdMatch ? publicIdMatch[1] : null;
                if (publicId) {
                    return cloudinary.uploader.destroy(publicId);
                }
                return Promise.resolve();
            })
            await Promise.all(deletePromises);
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });




    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// controller to upload csv file

export const importProductsCSV = async (req: any, res: any) => {
    try {

        const products: any[] = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (row) => {

                console.log(row);

                products.push({
                    sku: row["Model/SKU"] || "",

                    name: row["Title"] || "Unnamed Product",

                    title: row["Title"] || "",

                    description: row["Product Description"] || "",

                    price: Number(row["Variant Price"]) || 0,

                    comparePrice: Number(row["Compare At Price"]) || 0,

                    images: row["Image Src"]
                        ? [row["Image Src"]]
                        : [],

                    sizes: row["Size"]
                        ? row["Size"].split(",").map((s: string) => s.trim())
                        : [],

                    category: row["Category"] || "Other",

                    stock: Number(row["Stock"]) || 0,

                    specifications: {},

                    highlights: {},

                    ratings: {
                        average: 0,
                        count: 0
                    },

                    isFeatured: false,

                    isActive: row["Status"] === "active"
                });

            })
            .on("end", async () => {

                await Product.insertMany(products);

                res.status(200).json({
                    success: true,
                    count: products.length
                });

            });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "CSV import failed"
        });
    }
};

// api to handle xlsx and csv file

export const importProducts = async (
    req: any,
    res: any
) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        const workbook = XLSX.readFile(req.file.path);

        const sheet =
            workbook.Sheets[
            workbook.SheetNames[0]
            ];

        const rows: any[] =
            XLSX.utils.sheet_to_json(sheet);

        const products = rows.map((row) => ({
            sku: row["Model/SKU"] || "",

            name: row["Title"] || "Unnamed Product",

            title: row["Title"] || "",

            description: row["Product Description"] || "",

            category: row["Category"] || "Other",

            price: Number(row["Price"]) || 0,

            comparePrice: Number(row["Compare Price"]) || 0,

            stock: Number(row["Stock"]) || 0,

            images: row["Image Src"]
                ? [row["Image Src"]]
                : [],

            sizes: row["Size"]
                ? row["Size"].split(",").map((s: string) => s.trim())
                : [],

            specifications: {},

            highlights: {},

            ratings: {
                average: 0,
                count: 0
            },

            isFeatured: false,

            isActive: true
        }));

        const result =
            await Product.insertMany(products);

        return res.status(200).json({
            success: true,
            inserted: result.length
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Import failed"
        });

    }
};