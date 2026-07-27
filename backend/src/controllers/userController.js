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
                ctx.throw(400, 'Email đã được sử dụng!');
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
            if (error.status === 400 || error.statusCode === 400 || error.code === '23505') {
                ctx.status = 400;
                ctx.body = {
                    success: false,
                    message: error.code === '23505' ? 'Email này đã được đăng ký trong hệ thống!' : error.message
                };
            } else {
                console.error("Lỗi hệ thống khi tạo user:", error);
                ctx.status = 500;
                ctx.body = {
                    success: false,
                    message: `Lỗi hệ thống khi tạo ${this.itemName}`,
                    error_detail: error.message || "Unknown error"
                };
            }
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
    update = async (ctx) => {
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
            const payload = { ...ctx.request.body }
            const file = ctx.file || (ctx.request && ctx.request.file);
            if (file) {
                payload.avatar = await uploadImageToStorage(file, 'user_avatars')
                if (response.avatar) {
                    await deleteImageFromStorage(response.avatar)
                }
            }
            if (payload.password && (await bcrypt.compare(payload.password, response.password_hash))) {
                ctx.status = 400;
                ctx.body = {
                    success: false,
                    message: "Mật khẩu mới phải khác mật khẩu cũ"
                };
                return;
            }
            if (payload.password) {
                const salt = await bcrypt.genSalt(10);
                const password_hash = await bcrypt.hash(payload.password, salt);
                payload.password_hash = password_hash;
                delete payload.password;
            }
            if (payload.email && payload.email !== response.email) {
                const isExist = await this.repository.checkExistEmail(payload.email);
                if (isExist) {
                    ctx.status = 400;
                    ctx.body = {
                        success: false,
                        message: "Email này đã được người khác sử dụng, vui lòng chọn email khác!"
                    };
                    return;
                }
            }
            const data = await this.repository.update(id, payload);
            ctx.status = 200;
            ctx.body = {
                success: true,
                message: `Sửa thông tin thành công user ${payload.name}`
            }
        } catch (error) {
            ctx.status = 500;
            ctx.body = { success: false, message: `Lỗi hệ thống khi cập nhật ${this.itemName}`, error_detail: error.message };
        }
    }
}

const userController = new UserController();

export const getAllUser = userController.getAll;
export const getUserById = userController.getById;
export const createUser = userController.create;
export const updateUser = userController.update;
export const deleteUser = userController.delete;