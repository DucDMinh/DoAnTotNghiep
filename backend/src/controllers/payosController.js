import { PayOS } from "@payos/node";
import dotenv from 'dotenv';
dotenv.config();

const payOS = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

export async function CreateEmbeddedPaymentLink(ctx) {
    const { selectedPlan } = ctx.request.body;
    const body = {
        orderCode: Number(String(Date.now()).slice(-6)),
        amount: selectedPlan,
        description: 'Thanh toan don hang',
        returnUrl: `${process.env.YOUR_DOMAIN}`,
        cancelUrl: `${process.env.YOUR_DOMAIN}`,
    };
    try {
        const paymentLinkResponse = await payOS.paymentRequests.create(body);
        ctx.status = 200;
        ctx.body = {
            success: true,
            message: "Tao link thanh cong",
            checkoutUrl: paymentLinkResponse.checkoutUrl,
            linkData: paymentLinkResponse
        }
    } catch (error) {
        console.error("Lỗi PayOS:", error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: `Loi: ${error}`
        }
    }
}

export async function ReceiveWebhook(ctx) {
    const webhookData = ctx.request.body;
    try {
        const paymentData = payOS.webhooks.verify(webhookData);
        if (webhookData.code === '00') {
            console.log(`webhookData: `, webhookData)
        }
        ctx.status = 200;
        ctx.body = {
            success: true,
            message: "Webhook processed successfully"
        };

    } catch (error) {
        console.error("Lỗi xác thực hoặc xử lý Webhook:", error);
        ctx.status = 200;
        ctx.body = {
            success: false,
            message: "Invalid webhook or processing error"
        };
    }
}