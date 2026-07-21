"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("@clerk/express");
const user_js_1 = __importDefault(require("../models/user.js"));
const makeAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const user = await user_js_1.default.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
        if (user) {
            await express_1.clerkClient.users.updateUserMetadata(user.clerkId, {
                publicMetadata: {
                    role: "admin",
                },
            });
            console.log(`${email} promoted to admin`);
        }
        else {
            console.log(`User with email ${email} not found`);
        }
    }
    catch (error) {
        console.log("Admin promotion failed", error.message);
    }
};
exports.default = makeAdmin;
