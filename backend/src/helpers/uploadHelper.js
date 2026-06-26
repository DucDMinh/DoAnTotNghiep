import { supabase } from '../config/supabaseClient.js'; // Nhớ trỏ đúng đường dẫn file client của bạn

export const uploadImageToStorage = async (file, folder) => {
    try {
        const fileExtension = file.originalname.split('.').pop();
        const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;

        const filePath = `${folder}/${uniqueFileName}`;

        const { data, error } = await supabase.storage
            .from('image')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype, // Khai báo loại file (image/png, image/jpeg...)
                upsert: false // Không cho phép ghi đè
            });

        if (error) {
            console.error("Lỗi từ Supabase Storage:", error.message);
            throw error;
        }

        // 3. Lấy đường link Public để lưu vào Database và hiển thị trên Web
        const { data: publicUrlData } = supabase.storage
            .from('image')
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;

    } catch (error) {
        console.error("Lỗi trong hàm uploadImageToStorage:", error);
        throw new Error("Không thể upload ảnh, vui lòng thử lại sau.");
    }
};