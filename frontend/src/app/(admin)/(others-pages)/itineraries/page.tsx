"use client";
import { useState } from "react";
import {
    Save, Calendar, DollarSign, MapPin,
    Plus, Trash2, Search, Filter, Map,
    ArrowLeft, CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Location } from "@/interface";
import { SetupScreen } from "@/components/itineraries/setup";

export default function ItineraryBuilderPage() {
    const [step, setStep] = useState<"SETUP" | "BUILDER">("SETUP");
    const [selectedProvinces, setSelectedProvinces] = useState<{ id: string, name: string }[]>([]);
    const [currentItinerary, setCurrentItinerary] = useState({
        title: "", startDate: "", endDate: "", theme: ""
    });
    const [locations, setLocations] = useState<Location[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [days, setDays] = useState<any[]>([]);

    const calculateTotalCost = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return days.reduce((total, day) => total + (day.locations?.reduce((sum: number, loc: any) => sum + (loc.cost || 0), 0) || 0), 0);
    };

    if (step === "SETUP") {
        return (
            <SetupScreen
                selectedProvinces={selectedProvinces}
                setSelectedProvinces={setSelectedProvinces}
                setLocations={setLocations}
                setStep={setStep}
                setCurrentItinerary={setCurrentItinerary}
                step={step}
            />
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-950 font-sans animate-in fade-in zoom-in-95 duration-300">
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
                <div className="flex items-center gap-4">
                    <button onClick={() => setStep("SETUP")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500" title="Quay lại">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                        <Map className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Thiết kế Lộ trình</h1>
                        <div className="flex gap-1.5 mt-0.5">
                            {selectedProvinces.length > 0 ? (
                                selectedProvinces.map(p => (
                                    <span key={p.id} className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md dark:bg-brand-900/30 dark:text-brand-400">{p.name}</span>
                                ))
                            ) : (
                                <span className="text-xs text-gray-500">Chưa chọn khu vực cụ thể</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-green-700 dark:bg-green-900/20 dark:text-green-400 hidden sm:flex">
                        <DollarSign className="h-5 w-5" />
                        <div>
                            <p className="text-xs font-semibold uppercase opacity-70">Tổng dự kiến</p>
                            <p className="text-lg font-bold leading-none">{calculateTotalCost().toLocaleString('vi-VN')} đ</p>
                        </div>
                    </div>
                    <button className="flex items-center rounded-xl bg-brand-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-700 active:scale-95">
                        <Save className="mr-2 h-4 w-4" /> Lưu
                    </button>
                </div>
            </header>

            <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-0 overflow-hidden h-[calc(100vh-80px)]">

                <div className="col-span-1 xl:col-span-8 overflow-y-auto p-6 lg:p-8 custom-scrollbar pb-32">

                    {/* KHỐI NHẬP THÔNG TIN TỔNG QUAN LỘ TRÌNH */}
                    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <input
                            type="text"
                            value={currentItinerary.title}
                            onChange={(e) => setCurrentItinerary({ ...currentItinerary, title: e.target.value })}
                            placeholder="Nhập tên lộ trình hấp dẫn (VD: Chinh phục Fansipan 2N1Đ...)"
                            className="w-full border-none bg-transparent text-3xl font-black text-gray-900 focus:outline-none focus:ring-0 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
                        />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    <Calendar className="mr-2 h-4 w-4" /> Ngày khởi hành
                                </label>
                                <input type="date" value={currentItinerary.startDate} onChange={(e) => setCurrentItinerary({ ...currentItinerary, startDate: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                            </div>
                            <div>
                                <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    <Calendar className="mr-2 h-4 w-4" /> Ngày kết thúc
                                </label>
                                <input type="date" value={currentItinerary.endDate} onChange={(e) => setCurrentItinerary({ ...currentItinerary, endDate: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                            </div>
                            <div>
                                <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    <MapPin className="mr-2 h-4 w-4" /> Chủ đề
                                </label>
                                <select value={currentItinerary.theme} onChange={(e) => setCurrentItinerary({ ...currentItinerary, theme: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                    <option value="">Chọn chủ đề...</option>
                                    <option value="Trekking & Khám phá">Trekking & Khám phá</option>
                                    <option value="Nghỉ dưỡng">Nghỉ dưỡng</option>
                                    <option value="Văn hóa - Lịch sử">Văn hóa - Lịch sử</option>
                                    <option value="Ẩm thực">Ẩm thực</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {days.length > 0 ? days.map((day) => (
                            <motion.div key={day.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50 rounded-t-2xl">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white dark:bg-white dark:text-gray-900">{day.dayNumber}</div>
                                        <input type="text" defaultValue={day.title} className="w-full border-none bg-transparent font-bold text-gray-900 focus:ring-0 dark:text-white" />
                                    </div>
                                    <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                                </div>

                                <div className="p-4">
                                    <button className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600">
                                        <Plus className="mr-2 h-4 w-4" /> Thêm hoạt động
                                    </button>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white/50 dark:bg-gray-900/50">
                                Chưa có lịch trình ngày nào. Bấm &quot;Thêm ngày mới&quot; để bắt đầu.
                            </div>
                        )}

                        <button className="mx-auto flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-gray-800 dark:bg-white dark:text-gray-900 mt-6">
                            <Plus className="mr-2 h-5 w-5" /> Thêm Ngày Mới
                        </button>
                    </div>
                </div>

                <div className="col-span-1 xl:col-span-4 border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 flex flex-col h-full">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Kho Địa Điểm</h3>
                        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            {selectedProvinces.length > 0
                                ? `Đang gợi ý các điểm tại ${selectedProvinces.map(p => p.name).join(", ")}`
                                : "Đang hiển thị tất cả địa điểm"}
                        </p>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="text" placeholder="Tìm tên địa điểm..." className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm" />
                            </div>
                            <button className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 shadow-sm">
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar pb-32">
                        {/* 🛠️ [NOTE CHO DEV]: Fetch Locations Pool dựa trên selectedProvinces và map tại đây */}
                        {(() => {
                            return locations.length > 0 ? (
                                locations.map((loc) => (
                                    <div
                                        key={loc.id}
                                        className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
                                    >

                                        {/* Ảnh Thumbnail */}
                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={loc.img} alt={loc.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        </div>

                                        {/* Nội dung thông tin */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                                                {loc.name}
                                            </h4>

                                            <div className="mt-1 flex items-center gap-1.5 truncate text-xs text-gray-500 dark:text-gray-400">
                                                <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>

                                                {/* Đổi màu text linh hoạt theo mức độ khó */}
                                                <span className={
                                                    loc.difficulty_level === 'Khó' ? 'text-red-500 font-medium' :
                                                        loc.difficulty_level === 'Trung bình' ? 'text-orange-500 font-medium' :
                                                            'text-green-500 font-medium'
                                                }>
                                                    {loc.difficulty_level}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Nút Thêm (Chỉ hiện ra khi Hover chuột vào thẻ) */}
                                        <button
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 opacity-0 transition-all hover:bg-brand-100 hover:text-brand-600 group-hover:opacity-100 dark:bg-gray-800 dark:hover:bg-brand-900/50 dark:hover:text-brand-400"
                                            title="Thêm vào lộ trình"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>

                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                                    Không tìm thấy địa điểm phù hợp.
                                </div>
                            );
                        })()}
                    </div>
                </div>

            </main>
        </div>
    );
}