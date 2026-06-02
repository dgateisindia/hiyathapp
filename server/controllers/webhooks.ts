import { verifyWebhook } from "@clerk/express/webhooks"
import { Response, Request } from "express"
import User from "../models/user"

export const clerkWebhook = async (req: Request, res: Response) => {
    try {

        console.log("🔥 WEBHOOK HIT");

        const evt = await verifyWebhook(req)

        console.log("✅ VERIFIED");

        if (evt.type === 'user.created' || evt.type === 'user.updated') {

            const existingUser = await User.findOne({
                clerkId: evt.data.id
            })

            const userData = {
                clerkId: evt.data.id,
                email: evt.data?.email_addresses[0].email_address,
                name: evt.data?.first_name + " " + evt.data?.last_name,
                image: evt.data?.image_url,
            }

            if (existingUser) {
                await User.findOneAndUpdate(
                    { clerkId: evt.data.id },
                    userData
                )
            } else {
                await User.create(userData)
            }
        }

        return res.json({
            success: true,
            message: 'webhook received'
        })

    } catch (err) {
        console.error('Error verifying webhook:', err)
        return res.status(400).send('Error verifying webhook')
    }
}