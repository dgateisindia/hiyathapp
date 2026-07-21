"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const AdminRouter = express_1.default.Router();
// Get dashboard stats
AdminRouter.get('/stats', auth_1.protect, (0, auth_1.authorize)('admin'), adminController_1.getDashboardStats);
exports.default = AdminRouter;
