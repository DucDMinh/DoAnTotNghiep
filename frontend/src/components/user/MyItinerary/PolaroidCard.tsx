/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Itinerary } from "@/interface";

interface PolaroidCardProps {
    // Dùng Partial để linh hoạt, không bị lỗi TS nếu thiếu 1 vài trường lúc truyền dữ liệu
    itinerary: Partial<Itinerary>;
}

export default function PolaroidCard({ itinerary }: PolaroidCardProps) {
    // Xử lý ảnh mặc định nếu lộ trình chưa có ảnh
    const defaultImage = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop";
    const imageUrl = itinerary.image_url || defaultImage;

    // Format tiền VNĐ
    const formattedCost = itinerary.estimated_cost
        ? itinerary.estimated_cost.toLocaleString('vi-VN') + 'đ'
        : 'Chưa cập nhật';

    return (
        <Link href={`/itinerary/${itinerary.id}`} className="group block">
            {/* 
        Khung Polaroid: 
        - Viền trắng (bg-white), đổ bóng (shadow-md)
        - Padding đều 3 cạnh trên-trái-phải (p-3), padding dưới dày hơn (pb-6) để giống ảnh Polaroid
        - Hiệu ứng hover: Nhấc lên nhẹ và xoay nghiêng 1 chút (hover:-translate-y-2 hover:rotate-1)
      */}
            <div className="bg-white p-3 pb-8 rounded-lg shadow-md border border-gray-100 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 group-hover:rotate-1">

                {/* Khung chứa ảnh */}
                <div className="relative w-full h-[220px] overflow-hidden rounded-md bg-gray-200">
                    <img
                        src={imageUrl}
                        alt={itinerary.title || "Hình ảnh lộ trình"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Tag Theme (Nổi trên ảnh) */}
                    {itinerary.theme && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-gray-800 rounded-full shadow-sm">
                            {itinerary.theme}
                        </div>
                    )}
                </div>

                {/* Nội dung text (Phần ghi chú dưới ảnh Polaroid) */}
                <div className="mt-4 flex flex-col gap-2">
                    {/* Tiêu đề (Cắt gọn nếu quá 2 dòng) */}
                    <h3 className="font-bold text-[18px] leading-tight text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {itinerary.title || "Chuyến đi mới"}
                    </h3>

                    {/* Thông tin số ngày & Tác giả */}
                    <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {itinerary.days} ngày {itinerary.nights} đêm
                        </span>

                        {/* Chi phí */}
                        <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md">
                            {formattedCost}
                        </span>
                    </div>

                    {/* User / Tác giả */}
                    {itinerary.user_id && (
                        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100">
                            <img
                                src={itinerary.user_id.avatar || "https://ui-avatars.com/api/?name=" + itinerary.user_id.name}
                                alt="Avatar"
                                className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xs text-gray-600 font-medium">
                                Tạo bởi <span className="font-semibold text-gray-900">{itinerary.user_id.name}</span>
                            </span>
                        </div>
                    )}
                </div>

            </div>
        </Link>
    );
}