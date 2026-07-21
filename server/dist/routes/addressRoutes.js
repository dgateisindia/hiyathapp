"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const addressController_1 = require("../controllers/addressController");
const AddressRouter = express_1.default.Router();
AddressRouter.get('/', auth_1.protect, addressController_1.getAddresses);
AddressRouter.post('/', auth_1.protect, addressController_1.addAddress);
AddressRouter.put('/:id', auth_1.protect, addressController_1.updateAddress);
AddressRouter.delete('/:id', auth_1.protect, addressController_1.deleteAddress);
exports.default = AddressRouter;
