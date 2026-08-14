import Router from '@koa/router';
import * as payosController from "../controllers/payosController.js";

const router = new Router();

router.post('/create-embedded-payment-link', payosController.CreateEmbeddedPaymentLink);
router.post('/webhook', payosController.ReceiveWebhook);

export default router;