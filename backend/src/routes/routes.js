import Router from '@koa/router';
import multer from '@koa/multer';
import * as provinceController from '../controllers/provinceController.js';
import * as locationController from '../controllers/locationController.js';

const router = new Router();
const upload = multer();

router.get('/locations', locationController.getAllLocations);
router.post('/locations', upload.single('image'), locationController.createLocation);
router.delete('/locations/:id', locationController.deleteLocation);
router.put('/locations/:id', upload.single('image'), locationController.updateLocation);

router.get('/provinces', provinceController.getAllProvinces);
router.post('/provinces', upload.none(), provinceController.createProvince);
router.delete('/provinces/:id', provinceController.deleteProvince);

export default router;