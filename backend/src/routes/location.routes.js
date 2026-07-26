import Router from '@koa/router';
import multer from '@koa/multer';
import * as locationController from '../controllers/locationController.js';
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const router = new Router({ prefix: '/locations' });
const upload = multer();

router.get('/', locationController.getAllLocations);
router.post('/', verifyToken, requireAdmin, upload.single('image'), locationController.createLocation);
router.put('/:id', verifyToken, requireAdmin, upload.single('image'), locationController.updateLocation);
router.delete('/:id', verifyToken, requireAdmin, locationController.deleteLocation);

export default router;