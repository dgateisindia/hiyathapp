"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clerkWebhook = void 0;
const webhooks_1 = require("@clerk/express/webhooks");
const user_1 = __importDefault(require("../models/user"));
const clerkWebhook = async (req, res) => {
    try {
        console.log("🔥 WEBHOOK HIT");
        const evt = await (0, webhooks_1.verifyWebhook)(req);
        console.log("✅ VERIFIED");
        if (evt.type === 'user.created' || evt.type === 'user.updated') {
            const existingUser = await user_1.default.findOne({
                clerkId: evt.data.id
            });
            const userData = {
                clerkId: evt.data.id,
                email: evt.data?.email_addresses[0].email_address,
                name: evt.data?.first_name + " " + evt.data?.last_name,
                image: evt.data?.image_url,
            };
            if (existingUser) {
                await user_1.default.findOneAndUpdate({ clerkId: evt.data.id }, userData);
            }
            else {
                await user_1.default.create(userData);
            }
        }
        return res.json({
            success: true,
            message: 'webhook received'
        });
    }
    catch (err) {
        console.error('Error verifying webhook:', err);
        return res.status(400).send('Error verifying webhook');
    }
};
exports.clerkWebhook = clerkWebhook;
