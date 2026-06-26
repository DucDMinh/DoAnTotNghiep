import { locationRepo } from '../repositories/locationRepository.js';
import { BaseController } from './baseController.js';
import { uploadImageToStorage } from '../helpers/uploadHelper.js';

class LocationController extends BaseController {
    constructor() {
        super(locationRepo, "Địa điểm");
    }
    create = async (ctx) => {
        try {
            const payload = { ...ctx.request.body };
            const file = ctx.request.file;
            if (file) {
                const imageUrl = await uploadImageToStorage(file, 'locations');
                payload.img = imageUrl;
            }
            const data = await this.repository.create(payload);

            ctx.status = 201;
            ctx.body = { success: true, message: `Tạo mới ${this.itemName} thành công`, data };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { success: false, message: `Lỗi hệ thống khi tạo ${this.itemName}`, error_detail: error.message };
        }
    }

    update = async (ctx) => {
        try {
            const id = ctx.params.id;
            const payload = { ...ctx.request.body };
            const file = ctx.request.file;

            if (file) {
                payload.img = await uploadImageToStorage(file, 'locations');
            }
            const data = await this.repository.update(id, payload);

            if (!data) {
                ctx.status = 404;
                ctx.body = { success: false, message: `Không tìm thấy ${this.itemName} để cập nhật (hoặc đã bị xóa)!` };
                return;
            }

            ctx.status = 200;
            ctx.body = { success: true, message: `Cập nhật ${this.itemName} thành công`, data };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { success: false, message: `Lỗi hệ thống khi cập nhật ${this.itemName}`, error_detail: error.message };
        }
    }
}

const locationController = new LocationController();

export const getAllLocations = locationController.getAll;
export const getLocationById = locationController.getById;
export const createLocation = locationController.create;
export const updateLocation = locationController.update;
export const deleteLocation = locationController.delete;