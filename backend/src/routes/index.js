import Router from '@koa/router';
import locationRoutes from './location.routes.js';
import provinceRoutes from './province.routes.js';
import itineraryRoutes from './itinerary.routes.js';
import authRoutes from './auth.routes.js';

const router = new Router();

router.use(locationRoutes.routes(), locationRoutes.allowedMethods());
router.use(provinceRoutes.routes(), provinceRoutes.allowedMethods());
router.use(itineraryRoutes.routes(), itineraryRoutes.allowedMethods());
router.use(authRoutes.routes(), authRoutes.allowedMethods)

export default router;