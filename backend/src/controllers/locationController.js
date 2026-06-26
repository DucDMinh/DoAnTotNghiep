import * as locationRepo from '../repositories/locationRepository.js';
import { supabase } from '../config/supabaseClient.js';

export const addLocation = async (ctx) => {
    try {
        const { name, lat, lng, description, province, difficulty_level, rating } = ctx.request.body;
        const file = ctx.request.file;

        if (!name || lat === undefined || lng === undefined) {
            ctx.status = 400;
            ctx.body = { success: false, message: "Thiếu thông tin bắt buộc" };
            return;
        }

        let imageUrl = null;
        if (file) {
            const fileName = `${Date.now()}-${file.originalname}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('location-images')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                });

            if (uploadError) throw uploadError;
            const { data: publicUrlData } = supabase.storage
                .from('location-images')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }
        const newLocation = await locationRepo.createLocation({
            name,
            lat,
            lng,
            img: imageUrl,
            description,
            province,
            difficulty_level,
            rating
        });

        ctx.status = 201;
        ctx.body = {
            success: true,
            message: "Thêm địa điểm và ảnh thành công!",
            data: newLocation
        };

    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: "Lỗi hệ thống khi thêm địa điểm",
            error_detail: error.message
        };
    }
};

export async function getAllLocations(ctx) {
    try {
        const locations = await locationRepo.getAllLocations();
        ctx.status = 200;
        ctx.body = {
            success: true,
            message: "Lấy danh sách địa điểm thành công!",
            data: locations
        };
        console.log("Lấy danh sách địa điểm thành công:", locations);
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: "Lỗi hệ thống khi lấy danh sách địa điểm",
            error_detail: error.message
        };
    }
}

export const deleteLocation = async (ctx) => {
    try {
        const id = ctx.params.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            ctx.status = 400;
            ctx.body = { success: false, message: "ID địa điểm không hợp lệ!" };
            return;
        }

        const locationToDelete = await locationRepo.getLocationById(id);

        if (!locationToDelete) {
            ctx.status = 404;
            ctx.body = { success: false, message: "Không tìm thấy địa điểm để xóa (hoặc đã bị xóa rồi)!" };
            return;
        }

        if (locationToDelete.img) {
            const fileName = locationToDelete.img.split('/').pop();

            const { error: removeError } = await supabase.storage
                .from('location-images')
                .remove([fileName]);

            if (removeError) {
                console.log("Cảnh báo: Không thể xóa ảnh trên Storage (có thể file không tồn tại):", removeError.message);
            } else {
                console.log("Đã dọn dẹp ảnh trên Storage thành công:", fileName);
            }
        }

        await locationRepo.deleteLocationById(id);

        ctx.status = 200;
        ctx.body = { success: true, message: "Đã xóa địa điểm và ảnh đính kèm thành công!" };

    } catch (error) {
        ctx.status = 500;
        ctx.body = { success: false, message: error.message };
    }
};

export const updateLocation = async (ctx) => {
    try {
        const id = ctx.params.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            ctx.status = 400;
            ctx.body = { success: false, message: "ID không đúng định dạng!" };
            return;
        }
        const { name, lat, lng } = ctx.request.body;
        const file = ctx.request.file;
        const oldLocation = await locationRepo.getLocationById(id);
        if (!oldLocation) {
            ctx.status = 404;
            ctx.body = { success: false, message: "Không tìm thấy địa điểm để sửa!" };
            return;
        }

        let updateData = {};
        if (name) updateData.name = name;
        if (lat !== undefined) updateData.lat = lat;
        if (lng !== undefined) updateData.lng = lng;
        if (file) {
            if (oldLocation.img) {
                const oldFileName = oldLocation.img.split('/').pop();
                const { error: removeError } = await supabase.storage
                    .from('location-images')
                    .remove([oldFileName]);

                if (removeError) {
                    console.log("Cảnh báo: Không xóa được ảnh cũ (Có thể file không tồn tại trên Storage)", removeError.message);
                }
            }
            const fileName = `${Date.now()}-${file.originalname}`;
            const { error: uploadError } = await supabase.storage
                .from('location-images')
                .upload(fileName, file.buffer, { contentType: file.mimetype });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('location-images')
                .getPublicUrl(fileName);

            updateData.img = publicUrlData.publicUrl;
        }
        const updatedLocation = await locationRepo.updateLocationById(id, updateData);

        ctx.status = 200;
        ctx.body = { success: true, message: "Cập nhật thành công!", data: updatedLocation };

    } catch (error) {
        ctx.status = 500;
        ctx.body = { success: false, message: error.message };
    }
};