import { BaseController } from './baseController.js';
import { userRepo } from '../repositories/userRepository.js';
import { uploadImageToStorage, deleteImageFromStorage } from '../helpers/uploadHelper.js';
import bcrypt from 'bcryptjs';

class UserController extends BaseController {
    constructor() {
        super(userRepo, "Người dùng");
    }

    create = async (ctx) => {
        try {
            const payload = { ...ctx.request.body };
            const file = ctx.file || (ctx.request && ctx.request.file);
            if (await this.repository.checkExistEmail(payload.email)) {
                ctx.status = 400;
                ctx.body = {
                    success: false,
                    message: "Email đã được sử dụng!"
                };
                return;
            }
            if (file) {
                const imageUrl = await uploadImageToStorage(file, 'user_avatars');
                payload.avatar = imageUrl;
            }
            if (payload.password) {
                const salt = await bcrypt.genSalt(10);
                const password_hash = await bcrypt.hash(payload.password, salt);

                payload.password_hash = password_hash;
                delete payload.password;
            }
            const { data: newUser, error } = await this.repository.create(payload);
            if (error) throw error;
            ctx.status = 201;
            ctx.body = {
                success: true,
                message: `Tạo mới ${this.itemName} thành công`,
                data: newUser
            };

        } catch (error) {
            console.error("Lỗi khi tạo user:", error);
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: `Lỗi hệ thống khi tạo ${this.itemName}`,
                error_detail: error.message
            };
        }
    }

    delete = async (ctx) => {
        try {
            const id = ctx.params.id;
            const response = await this.repository.getById(id);
            if (!response) {
                ctx.status = 400;
                ctx.body = {
                    success: false,
                    message: 'Người dùng không tồn tại'
                }
                return;
            }
            const data = await this.repository.delete(id);
            if (data && response.avatar) {
                await deleteImageFromStorage(response.avatar)
            }
            ctx.status = 200;
            ctx.body = { success: true, message: `Xóa ${this.itemName} và dọn dẹp ảnh thành công`, data };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { success: false, message: `Lỗi hệ thống khi xóa ${this.itemName}`, error_detail: error.message };
        }
    }
}

const userController = new UserController();

export const getAllUser = userController.getAll;
export const getUserById = userController.getById;
export const createUser = userController.create;
export const updateUser = userController.update;
export const deleteUser = userController.delete;