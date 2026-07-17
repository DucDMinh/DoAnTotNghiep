import { itineraryRepo } from "../repositories/itineraryRepository.js";
import { BaseController } from "./baseController.js";

class ItineraryController extends BaseController {
    constructor() {
        super(itineraryRepo, "Lộ trình");
    }

    create = async (ctx) => {
        try {
            const payload = { ...ctx.request.body };

            if (payload.itinerary_days && typeof payload.itinerary_days === 'string') {
                payload.itinerary_days = JSON.parse(payload.itinerary_days);
            }
            if (payload.itinerary_provinces && typeof payload.itinerary_provinces === 'string') {
                payload.itinerary_provinces = JSON.parse(payload.itinerary_provinces);
            }
            if (payload.estimated_cost) {
                payload.estimated_cost = Number(payload.estimated_cost);
            }
            if (payload.nights) payload.nights = Number(payload.nights);
            if (payload.days) payload.days = Number(payload.days);
            if (payload.share !== undefined) {
                payload.share = payload.share === 'true';
            }
            console.log(JSON.stringify(payload, null, 2));
            const data = await this.repository.create(payload);

            ctx.status = 201;
            ctx.body = { success: true, message: `Tạo mới ${this.itemName} thành công`, data };
        } catch (error) {
            console.error("Lỗi tạo lộ trình:", error);
            ctx.status = 500;
            ctx.body = { success: false, message: `Lỗi hệ thống khi tạo ${this.itemName}`, error_detail: error.message };
        }
    }
}

const itineraryController = new ItineraryController();

export const getAllItineraries = itineraryController.getAll;
export const getItineraryById = itineraryController.getById;
export const createItinerary = itineraryController.create;
export const updateItinerary = itineraryController.update;
export const deleteItinerary = itineraryController.delete;