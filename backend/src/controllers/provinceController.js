import { provinceRepo } from '../repositories/provinceRepository.js';
import { BaseController } from './baseController.js';
import { uploadImageToStorage, deleteImageFromStorage } from '../helpers/uploadHelper.js';

class ProvinceController extends BaseController {
    constructor() {
        super(provinceRepo, "Địa điểm");
    }
    create = async (ctx) => {
        try {
            const payload = { ...ctx.request.body };
            const file = ctx.request.file;
            console.log("Received file:", file); // Debugging line to check the received file
            if (file) {
                const imageUrl = await uploadImageToStorage(file, 'provinces'); // Specify the folder name in Supabase Storage
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

            const oldProvince = await this.repository.getById(id);
            if (!oldProvince) {
                ctx.status = 404;
                ctx.body = { success: false, message: `Không tìm thấy ${this.itemName} để cập nhật!` };
                return;
            }

            if (file) {
                payload.img = await uploadImageToStorage(file);

                if (oldProvince.img) {
                    await deleteImageFromStorage(oldProvince.img);
                }
            }

            const data = await this.repository.update(id, payload);

            ctx.status = 200;
            ctx.body = { success: true, message: `Cập nhật ${this.itemName} thành công`, data };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { success: false, message: `Lỗi hệ thống khi cập nhật ${this.itemName}`, error_detail: error.message };
        }
    }
    delete = async (ctx) => {
        try {
            const id = ctx.params.id;

            const oldProvince = await this.repository.getById(id);
            if (!oldProvince) {
                ctx.status = 404;
                ctx.body = { success: false, message: `Không tìm thấy ${this.itemName} để xóa!` };
                return;
            }

            const data = await this.repository.delete(id);

            if (data && oldProvince.img) {
                await deleteImageFromStorage(oldProvince.img);
            }

            ctx.status = 200;
            ctx.body = { success: true, message: `Xóa ${this.itemName} và dọn dẹp ảnh thành công`, data };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { success: false, message: `Lỗi hệ thống khi xóa ${this.itemName}`, error_detail: error.message };
        }
    }
    getAll = async (ctx) => {
        try {
            const page = parseInt(ctx.query.page) || 1;
            const limit = parseInt(ctx.query.limit) || 5;
            const search = ctx.query.search || '';
            const { data, count, error } = await this.repository.getAll(page, limit, search);
            if (error) throw error;
            ctx.status = 200;
            ctx.body = {
                success: true,
                data: data,
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { success: false, message: `Lỗi hệ thống khi lấy danh sách ${this.itemName}`, error_detail: error.message };
        }
    }
}

const provinceController = new ProvinceController();

export const getAllProvinces = provinceController.getAll;
export const getProvinceById = provinceController.getById;
export const createProvince = provinceController.create;
export const updateProvince = provinceController.update;
export const deleteProvince = provinceController.delete;