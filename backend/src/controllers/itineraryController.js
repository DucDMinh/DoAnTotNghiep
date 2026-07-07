import { itineraryRepo } from "../repositories/itineraryRepository.js";
import { itineraryDaysRepo } from "../repositories/itinerary_daysRepository.js";
import { itineraryLocationsRepo } from "../repositories/itinerary_locationsRepository.js";
import { BaseController } from "./baseController.js";

class ItineraryController extends BaseController {
    constructor() {
        super(itineraryRepo, "Lộ trình");
    }
}

const itineraryController = new ItineraryController();

export const getAllItineraries = itineraryController.getAll;
export const getItineraryById = itineraryController.getById;
export const createItinerary = itineraryController.create;
export const updateItinerary = itineraryController.update;
export const deleteItinerary = itineraryController.delete;

class ItineraryDaysController extends BaseController {
    constructor() {
        super(itineraryDaysRepo, "Lộ trình trong ngày");
    }
}

const itineraryDaysController = new ItineraryDaysController();

export const getAllItineraryDays = itineraryDaysController.getAll;
export const getItineraryDayById = itineraryDaysController.getById;
export const createItineraryDay = itineraryDaysController.create;
export const updateItineraryDay = itineraryDaysController.update;
export const deleteItineraryDay = itineraryDaysController.delete;

class ItineraryLocationsController extends BaseController {
    constructor() {
        super(itineraryLocationsRepo, "Lộ trình địa điểm");
    }
}

const itineraryLocationsController = new ItineraryLocationsController();

export const getAllItineraryLocations = itineraryLocationsController.getAll;
export const getItineraryLocationById = itineraryLocationsController.getById;
export const createItineraryLocation = itineraryLocationsController.create;
export const updateItineraryLocation = itineraryLocationsController.update;
export const deleteItineraryLocation = itineraryLocationsController.delete;