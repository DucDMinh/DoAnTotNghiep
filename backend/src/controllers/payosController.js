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
    console.log(`${process.env.YOUR_DOMAIN}`)

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