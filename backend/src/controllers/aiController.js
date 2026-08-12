import OpenAI from 'openai';
import { supabase } from '../config/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();
let rawKey = process.env.MY_NEW_GROQ_KEY || process.env.GROQ_API_KEY || "";
let cleanApiKey = rawKey.trim().replace(/['"]/g, '');
if (cleanApiKey.endsWith('s')) {
    cleanApiKey = cleanApiKey.slice(0, -1);
}
console.log("API Key sau khi đã lọc:", cleanApiKey);
const openai = new OpenAI({
    apiKey: cleanApiKey,
    baseURL: "https://api.groq.com/openai/v1"
});

export async function generateItinerary(ctx) {
    try {
        const { prompt, days_count } = ctx.request.body;
        if (!prompt) {
            ctx.status = 400;
            ctx.body = { success: false, message: "Vui lòng cung cấp prompt yêu cầu." };
            return;
        }
        const receptionistPrompt = `
        Đọc yêu cầu du lịch sau và phân tích.
        Nếu yêu cầu KHÔNG liên quan đến du lịch, đặt "is_valid" = false.
        
        LUẬT TRÍCH XUẤT ĐỊA DANH (RẤT QUAN TRỌNG):
        1. province_name: Trích xuất tên Tỉnh/Thành phố.
        2. keywords: NẾU người dùng nhập tên một cung đường (VD: Hà Giang Loop), một vùng miền (Tây Bắc, Miền Tây), hoặc tên một Tỉnh có thể đã thay đổi địa giới hành chính... BẠN BẮT BUỘC phải tự động liệt kê 3-5 địa danh, danh lam thắng cảnh CỤ THỂ nổi tiếng nhất thuộc khu vực đó vào mảng keywords.
        (Ví dụ: Khách nhập "Hà Giang Loop" -> keywords phải là ["Mã Pí Lèng", "Đồng Văn", "Sông Nho Quế", "Quản Bạ"]).
        Điều này giúp Database tìm kiếm chính xác dù tên Tỉnh không còn khớp.

        Trả về JSON:
        {
          "is_valid": true,
          "error_message": "",
          "route_legs": [
            { 
              "leg": 1, 
              "province_name": "Tên Tỉnh/Thành phố (VD: Hà Giang)", 
              "keywords": ["Từ khóa 1", "Từ khóa 2", "Từ khóa 3"] 
            }
          ]
        }
        `;

        const receptionistRes = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0,
            messages: [
                { role: "system", content: receptionistPrompt },
                { role: "user", content: prompt }
            ]
        });

        const intentData = JSON.parse(receptionistRes.choices[0].message.content);

        if (!intentData.is_valid) {
            ctx.status = 400;
            ctx.body = { success: false, message: intentData.error_message || "Yêu cầu không hợp lệ." };
            return;
        }
        const legsData = await Promise.all(
            intentData.route_legs.map(async (leg) => {
                let locations = [];
                console.log(`\n--- [DEBUG] ĐANG XỬ LÝ CHẶNG: ${leg.leg} ---`);
                console.log(`[DEBUG] AI Lễ tân phân tích Tỉnh: "${leg.province_name}" | Từ khóa:`, leg.keywords);
                const { data: provinceData, error: provError } = await supabase
                    .from('provinces')
                    .select('id, name')
                    .ilike('name', `%${leg.province_name}%`)
                    .limit(1)
                    .maybeSingle();

                if (provError) {
                    console.error("[DEBUG] ❌ LỖI QUERY PROVINCES:", provError.message);
                }

                if (provinceData) {
                    console.log(`[DEBUG] ✅ Đã match được Tỉnh trong DB: [${provinceData.id}] - ${provinceData.name}`);
                } else {
                    console.log(`[DEBUG] ⚠️ KHÔNG match được Tỉnh nào có tên chứa chữ "${leg.province_name}"`);
                }
                let query = supabase.from('locations').select('id, name, lat, lng, description');

                if (provinceData) {
                    console.log("[DEBUG] 👉 Đang dùng CÁCH A: Tìm tất cả locations theo province_id");
                    query = query.eq('province_id', provinceData.id);
                } else if (leg.keywords && leg.keywords.length > 0) {
                    console.log("[DEBUG] 👉 Đang dùng CÁCH B: Tìm locations theo từ khóa (keywords)");
                    const orConditions = leg.keywords.map(kw => `name.ilike.%${kw}%,description.ilike.%${kw}%`).join(',');
                    query = query.or(orConditions);
                } else {
                    console.log("[DEBUG] 👉 Đang dùng CÁCH C: Fallback tìm locations chứa tên Tỉnh");
                    query = query.or(`name.ilike.%${leg.province_name}%,description.ilike.%${leg.province_name}%`);
                }
                const { data: locData, error: locError } = await query.limit(12);

                if (locError) {
                    console.error("[DEBUG] ❌ LỖI QUERY LOCATIONS:", locError.message);
                }

                locations = locData || [];
                console.log(`[DEBUG] 🎯 Đã tìm thấy ${locations.length} địa điểm cho chặng này.`);

                return {
                    leg_number: leg.leg,
                    province_id: provinceData ? provinceData.id : null,
                    province_matched: provinceData ? provinceData.name : leg.province_name,
                    available_locations: locations
                };
            })
        );

        const totalLocationsFound = legsData.reduce((sum, leg) => sum + leg.available_locations.length, 0);
        if (totalLocationsFound === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: "Không tìm thấy địa điểm nào trong hệ thống khớp với tuyến đường của bạn. Vui lòng thử địa danh khác!"
            };
            return;
        }
        const plannerPrompt = `
        Bạn là hệ thống ánh xạ dữ liệu (Data Mapper) nghiêm ngặt.
        Nhiệm vụ: Tạo lịch trình ${days_count || 3} ngày từ DANH SÁCH ĐỊA ĐIỂM CUNG CẤP.
        
        LUẬT TỐI THƯỢNG (PHẢI TUÂN THỦ 100%):
        1. BẠN KHÔNG ĐƯỢC PHÉP SÁNG TẠO ĐỊA ĐIỂM MỚI.
        2. CHỈ ĐƯỢC PHÉP CHỌN CÁC ĐỊA ĐIỂM CÓ TRONG "DANH SÁCH ĐỊA ĐIỂM".
        3. Phải sao chép chính xác tuyệt đối 'location_id', 'location_name', 'lat', 'lng' từ danh sách.
        4. Nếu một ngày không có đủ địa điểm trong danh sách, hãy để ít địa điểm thôi, TUYỆT ĐỐI KHÔNG TỰ BỊA THÊM.

        DANH SÁCH ĐỊA ĐIỂM (CHỈ ĐƯỢC CHỌN TRONG NÀY):
        ${JSON.stringify(legsData)}

        TRẢ VỀ JSON ĐÚNG CẤU TRÚC NÀY:
        {
          "title": "Tên chuyến đi",
          "theme": "Khám phá/Nghỉ dưỡng...",
          "summary": "Tóm tắt...",
          "estimated_cost": 5000000,
          "itinerary_provinces": [
            {
              "province_id": "Lấy chính xác từ trường province_id trong danh sách mớm vào",
              "province_name": "Tên của tỉnh đó"
            }
          ],
          "itinerary_days": [
            {
              "day_number": 1,
              "title": "Ngày 1: ...",
              "itinerary_locations": [
                {
                  "location_id": "Lấy từ id trong danh sách",
                  "location_name": "Lấy từ name trong danh sách",
                  "lat": 12.34,
                  "lng": 105.67,
                  "start_time": "08:00",
                  "end_time": "10:00",
                  "cost": 100000,
                  "activity_note": "Ghi chú...",
                  "sequence_order": 1
                }
              ]
            }
          ]
        }
        `;

        const plannerRes = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.5,
            messages: [
                { role: "system", content: plannerPrompt },
                { role: "user", content: `Hãy xếp lịch trình cho yêu cầu: ${prompt}` }
            ]
        });

        const finalItinerary = JSON.parse(plannerRes.choices[0].message.content);
        ctx.status = 200;
        ctx.body = {
            success: true,
            message: "Tạo lịch trình AI thành công",
            data: finalItinerary
        };

    } catch (error) {
        console.error("Lỗi AI Planner:", error);
        ctx.status = 500;
        ctx.body = { success: false, message: "Lỗi hệ thống khi tạo lịch trình AI", error_detail: error.message };
    }
}