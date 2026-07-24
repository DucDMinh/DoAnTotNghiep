import Router from '@koa/router';
import multer from '@koa/multer';
import * as provinceController from '../controllers/provinceController.js';
import * as locationController from '../controllers/locationController.js';
import * as itineraryController from '../controllers/itineraryController.js';
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const router = new Router();
const upload = multer();

router.get('/locations', locationController.getAllLocations);
router.post('/locations', verifyToken, requireAdmin, upload.single('image'), locationController.createLocation);
router.put('/locations/:id', verifyToken, requireAdmin, upload.single('image'), locationController.updateLocation);
router.delete('/locations/:id', verifyToken, requireAdmin, locationController.deleteLocation);

router.get('/provinces', provinceController.getAllProvinces);
router.get('/provinces/:id', provinceController.getProvinceById);
router.post('/provinces', verifyToken, requireAdmin, upload.single('image'), provinceController.createProvince);
router.put('/provinces/:id', verifyToken, requireAdmin, upload.single('image_url'), provinceController.updateProvince);
router.delete('/provinces/:id', verifyToken, requireAdmin, provinceController.deleteProvince);

router.get('/itineraries', itineraryController.getAllItineraries);
router.get('/itineraries/:id', itineraryController.getItineraryById);
router.post('/itineraries', verifyToken, upload.single('image'), itineraryController.createItinerary);
router.put('/itineraries/:id', verifyToken, upload.single('image'), itineraryController.updateItinerary);
router.delete('/itineraries/:id', verifyToken, itineraryController.deleteItinerary);

export default router;