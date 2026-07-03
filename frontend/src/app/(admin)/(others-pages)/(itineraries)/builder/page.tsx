"use client";
import React, { useState } from "react";
import {
    Save, Calendar, Clock, DollarSign, MapPin,
    Plus, Trash2, GripVertical, Search, Filter, Image as ImageIcon, Map,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ItineraryBuilderPage() {
    // State mô phỏng dữ liệu Lộ trình đang tạo
    const [itinerary, setItinerary] = useState({
        title: "",
        summary: "",
        startDate: "",
        endDate: "",
        theme: "",
    });

    // State mô phỏng các Ngày và Địa điểm bên trong ngày đó
    const [days, setDays] = useState([
        {
            id: "day-1",
            dayNumber: 1,
            title: "Khám phá bản làng và nhận phòng",
            locations: [
                {
                    id: "loc-1",
                    name: "Bản Cát Cát",
                    startTime: "08:00",
                    endTime: "11:30",
                    cost: 150000,
                    note: "Thuê trang phục dân tộc chụp ảnh ở đầu bản.",
                }
            ]
        }
    ]);

    // Hàm tính tổng chi phí tự động (Real-time)
    const calculateTotalCost = () => {
        return days.reduce((total, day) => {
            const dayCost = day.locations.reduce((sum, loc) => sum + (loc.cost || 0), 0);
            return total + dayCost;
        }, 0);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-950 font-sans">
            {/* --- HEADER --- */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                        <Map className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Trình thiết kế Lộ trình</h1>
                        <p className="text-sm text-gray-500">Kéo thả để sắp xếp lịch trình tối ưu nhất</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Bảng tính tổng tiền tự động */}
                    <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        <DollarSign className="h-5 w-5" />
                        <div>
                            <p className="text-xs font-semibold uppercase opacity-70">Tổng dự kiến</p>
                            <p className="text-lg font-bold leading-none">{calculateTotalCost().toLocaleString('vi-VN')} đ</p>
                        </div>
                    </div>

                    <button className="flex items-center rounded-xl bg-brand-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-700 active:scale-95">
                        <Save className="mr-2 h-4 w-4" />
                        Lưu Lộ Trình
                    </button>
                </div>
            </header>

            {/* --- WORKSPACE CHÍNH --- */}
            <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-0 overflow-hidden h-[calc(100vh-80px)]">

                {/* CỘT TRÁI: CANVAS LỘ TRÌNH (Chiếm 8 phần) */}
                <div className="col-span-1 xl:col-span-8 overflow-y-auto p-6 lg:p-8 custom-scrollbar pb-32">

                    {/* Block 1: Thông tin chung */}
                    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <input
                            type="text"
                            placeholder="Nhập tên lộ trình hấp dẫn (VD: Chinh phục Fansipan 2N1Đ...)"
                            className="w-full border-none bg-transparent text-3xl font-black text-gray-900 focus:outline-none focus:ring-0 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
                        />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    <Calendar className="mr-2 h-4 w-4" /> Ngày khởi hành
                                </label>
                                <input type="date" className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                            </div>
                            <div>
                                <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    <Calendar className="mr-2 h-4 w-4" /> Ngày kết thúc
                                </label>
                                <input type="date" className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                            </div>
                            <div>
                                <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    <MapPin className="mr-2 h-4 w-4" /> Chủ đề
                                </label>
                                <select className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                    <option>Trekking & Khám phá</option>
                                    <option>Nghỉ dưỡng</option>
                                    <option>Văn hóa - Lịch sử</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Block 2: Danh sách các Ngày (Timeline) */}
                    <div className="space-y-6">
                        {days.map((day, index) => (
                            <motion.div
                                key={day.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                            >
                                {/* Header Ngày */}
                                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50 rounded-t-2xl">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white dark:bg-white dark:text-gray-900">
                                            {day.dayNumber}
                                        </div>
                                        <input
                                            type="text"
                                            defaultValue={day.title}
                                            placeholder="Tiêu đề ngày này..."
                                            className="w-full border-none bg-transparent font-bold text-gray-900 focus:ring-0 dark:text-white"
                                        />
                                    </div>
                                    <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                                </div>

                                {/* Body Ngày: Các địa điểm */}
                                <div className="p-6">
                                    {day.locations.map((loc, locIndex) => (
                                        <div key={loc.id} className="group relative mb-4 flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50">

                                            {/* Nút Kéo Thả (Drag Handle) */}
                                            <div className="mt-8 cursor-grab text-gray-400 hover:text-gray-700 dark:text-gray-500">
                                                <GripVertical className="h-5 w-5" />
                                            </div>

                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-brand-600 dark:text-brand-400 text-lg flex items-center">
                                                        <MapPin className="h-4 w-4 mr-1.5" />
                                                        {loc.name}
                                                    </h4>
                                                    <button className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X className="h-4 w-4" /> {/* Bạn nhớ import X từ lucide-react nhé */}
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Nhập Giờ */}
                                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        <input type="time" defaultValue={loc.startTime} className="bg-transparent text-sm font-medium focus:outline-none w-full dark:text-white" />
                                                        <span className="text-gray-400">-</span>
                                                        <input type="time" defaultValue={loc.endTime} className="bg-transparent text-sm font-medium focus:outline-none w-full dark:text-white" />
                                                    </div>

                                                    {/* Nhập Chi phí */}
                                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                                        <input type="number" placeholder="Chi phí (VNĐ)" defaultValue={loc.cost} className="bg-transparent text-sm font-medium focus:outline-none w-full dark:text-white placeholder:text-gray-400" />
                                                    </div>
                                                </div>

                                                {/* Ghi chú */}
                                                <input
                                                    type="text"
                                                    placeholder="Ghi chú hoạt động tại đây..."
                                                    defaultValue={loc.note}
                                                    className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-1 text-sm text-gray-600 dark:text-gray-300 focus:border-brand-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <button className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-800 dark:bg-gray-900/20 dark:hover:border-brand-700 dark:hover:bg-brand-900/20 dark:hover:text-brand-400">
                                        <Plus className="mr-2 h-4 w-4" /> Thêm hoạt động vào Ngày {day.dayNumber}
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        <button className="mx-auto flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-gray-800 dark:bg-white dark:text-gray-900">
                            <Plus className="mr-2 h-5 w-5" /> Thêm Ngày Mới
                        </button>
                    </div>
                </div>

                {/* CỘT PHẢI: KHO ĐỊA ĐIỂM (Chiếm 4 phần) */}
                <div className="col-span-1 xl:col-span-4 border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 flex flex-col h-full">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Kho Địa Điểm</h3>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="text" placeholder="Tìm tên địa điểm..." className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                            </div>
                            <button className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar pb-32">
                        {/* Render thử 3 Location Card để chọn */}
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 p-3 hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:hover:border-brand-700 transition-all">
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                    <img src={`https://placehold.co/100x100?text=Loc+${item}`} alt="Loc" className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">Đỉnh Fansipan</h4>
                                    <p className="truncate text-xs text-gray-500">Lào Cai • Độ khó: Cao</p>
                                </div>
                                <button className="shrink-0 rounded-full bg-gray-100 p-2 text-brand-600 opacity-0 transition-all hover:bg-brand-100 group-hover:opacity-100 dark:bg-gray-800 dark:text-brand-400 dark:hover:bg-brand-900">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}