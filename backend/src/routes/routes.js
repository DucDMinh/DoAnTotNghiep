import Router from '@koa/router';
import multer from '@koa/multer';
import * as provinceController from '../controllers/provinceController.js';
import * as locationController from '../controllers/locationController.js';
import * as itineraryController from '../controllers/itineraryController.js';

const router = new Router();
const upload = multer();

router.get('/locations', locationController.getAllLocations);
router.post('/locations', upload.single('image'), locationController.createLocation);
router.delete('/locations/:id', locationController.deleteLocation);
router.put('/locations/:id', upload.single('image'), locationController.updateLocation);

router.get('/provinces', provinceController.getAllProvinces);
router.get('/provinces/:id', provinceController.getProvinceById);
router.post('/provinces', upload.single('image'), provinceController.createProvince);
router.delete('/provinces/:id', provinceController.deleteProvince);
router.put('/provinces/:id', upload.single('image'), provinceController.updateProvince);

router.post('/itineraries', upload.single('image'), itineraryController.createItinerary);
router.get('/itineraries/', itineraryController.getAllItineraries);
router.get('/itineraries/:id', itineraryController.getItineraryById);
router.put('/itineraries/:id', upload.single('image'), itineraryController.updateItinerary);
router.delete('/itineraries/:id', itineraryController.deleteItinerary);

router.get('/itinerary-days', itineraryController.getAllItineraryDays);
router.get('/itinerary-days/:id', itineraryController.getItineraryDayById);
router.post('/itinerary-days', itineraryController.createItineraryDay);
router.put('/itinerary-days/:id', itineraryController.updateItineraryDay);
router.delete('/itinerary-days/:id', itineraryController.deleteItineraryDay);

router.get('/itinerary-locations', itineraryController.getAllItineraryLocations);
router.get('/itinerary-locations/:id', itineraryController.getItineraryLocationById);
router.post('/itinerary-locations', itineraryController.createItineraryLocation);
router.put('/itinerary-locations/:id', itineraryController.updateItineraryLocation);
router.delete('/itinerary-locations/:id', itineraryController.deleteItineraryLocation);

export default router;