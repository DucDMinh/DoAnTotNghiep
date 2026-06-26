import Router from '@koa/router';
import multer from '@koa/multer';
import * as locationController from '../controllers/locationController.js';

const router = new Router();
const upload = multer();

router.get('/locations', locationController.getAllLocations);
router.post('/locations', upload.single('image'), locationController.addLocation);
router.delete('/locations/:id', locationController.deleteLocation);
router.put('/locations/:id', upload.single('image'), locationController.updateLocation);

export default router;