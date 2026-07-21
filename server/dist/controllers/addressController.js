"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.getAddresses = void 0;
const Address_1 = __importDefault(require("../models/Address"));
// Get user addresses
// GET /api/addresses
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address_1.default.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.json({ success: true, data: addresses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAddresses = getAddresses;
// Add new address
// POST /api/addresses
const addAddress = async (req, res) => {
    try {
        const { type, street, city, state, zipCode, country, isDefault } = req.body;
        if (isDefault) {
            await Address_1.default.updateMany({ user: req.user._id }, { isDefault: false });
        }
        const newAddress = await Address_1.default.create({ user: req.user._id, type, street, city, state, zipCode, country, isDefault: isDefault || false });
        res.status(201).json({ success: true, data: newAddress });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addAddress = addAddress;
// Update address
// PUT /api/addresses/:id
const updateAddress = async (req, res) => {
    try {
        const { type, street, city, state, zipCode, country, isDefault } = req.body;
        let addressItem = await Address_1.default.findById(req.params.id);
        if (!addressItem) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        // Ensure user owns address
        if (addressItem.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
        if (isDefault) {
            await Address_1.default.updateMany({ user: req.user._id }, { isDefault: false });
        }
        addressItem = await Address_1.default.findByIdAndUpdate(req.params.id, { type, street, city, state, zipCode, country, isDefault: isDefault }, { new: true });
        res.status(201).json({ success: true, data: addressItem });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateAddress = updateAddress;
// Delete address
// DELETE /api/addresses/:id
const deleteAddress = async (req, res) => {
    try {
        const address = await Address_1.default.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        // Ensure user owns address
        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
        await address.deleteOne();
        res.status(201).json({ success: true, message: "Address removed" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteAddress = deleteAddress;
