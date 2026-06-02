import { clerkClient } from "@clerk/express";
import User from "../models/user.js";

const makeAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;

        const user = await User.findOneAndUpdate(
            { email },
            { role: "admin" },
            { new: true }
        );

        if (user) {
            await clerkClient.users.updateUserMetadata(
                user.clerkId as string,
                {
                    publicMetadata: {
                        role: "admin",
                    },
                }
            );

            console.log(`${email} promoted to admin`);
        } else {
            console.log(`User with email ${email} not found`);
        }
    } catch (error: any) {
        console.log("Admin promotion failed", error.message);
    }
};

export default makeAdmin;