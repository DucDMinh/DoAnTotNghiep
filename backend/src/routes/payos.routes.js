import Router from '@koa/router';
import * as payosController from "../controllers/payosController.js";

const router = new Router();

router.post('/create-embedded-payment-link', payosController.CreateEmbeddedPaymentLink)

export default router;