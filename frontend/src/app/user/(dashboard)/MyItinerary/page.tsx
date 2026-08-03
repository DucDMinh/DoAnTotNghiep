/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Compass,
    Calendar,
    MapPin,
    Clock,
    Plus,
    PlaneTakeoff,
    Archive,
    Pencil,
    Trash2,
    Share2,
    Lock
} from "lucide-react";
import toast from "react-hot-toast";
import { Itinerary } from "@/interface";
const MOCK_MY_ITINERARIES: Itinerary[] = [
    {
        id: "iti-1",
        title: "Đà Lạt 3 Ngày - Trốn phố về rừng",
        summary: "Chuyến đi chữa lành ngắm hoàng hôn và săn mây đồi Đa Phú",
        start_date: "2026-08-15T00:00:00.000Z", // Sắp khởi hành (Tương lai so với T7/2026)
        end_date: "2026-08-17T00:00:00.000Z",
        theme: "Thư giãn & Healing",
        days: 3,
        nights: 2,
        estimated_cost: 3200000,
        image_url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800",
        share: false, // Lộ trình riêng tư
        user_id: null,
        itinerary_provinces: [
            { province_id: "p1", provinces: { id: "p1", name: "Lâm Đồng", description: "" } }
        ],
        itinerary_days: []
    },
    {
        id: "iti-2",
        title: "Hà Giang - Chinh phục Mã Pì Lèng",
        summary: "Hành trình thanh xuân rực rỡ nhất",
        start_date: "2026-05-10T00:00:00.000Z", // Đã hoàn thành (Quá khứ)
        end_date: "2026-05-13T00:00:00.000Z",
        theme: "Trekking & Khám phá",
        days: 4,
        nights: 3,
        estimated_cost: 4500000,
        image_url: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800",
        share: true, // Đã chia sẻ cho cộng đồng
        user_id: null,
        itinerary_provinces: [
            { province_id: "p2", provinces: { id: "p2", name: "Hà Giang", description: "" } }
        ],
        itinerary_days: []
    },
    {
        id: "iti-3",
        title: "Food Tour Hải Phòng trong ngày",
        summary: "Ăn sập phố cảng với ngân sách sinh viên",
        start_date: "2026-09-02T00:00:00.000Z",
        end_date: "2026-09-02T00:00:00.000Z",
        theme: "Ẩm thực & Food Tour",
        days: 1,
        nights: 0,
        estimated_cost: 850000,
        image_url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800",
        share: true,
        user_id: null,
        itinerary_provinces: [
            { province_id: "p3", provinces: { id: "p3", name: "Hải Phòng", description: "" } }
        ],
        itinerary_days: []
    }
];

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================
function WashiTape({ color = "var(--washi-teal)", className = "" }: { color?: string; className?: string }) {
    return (
        <div className={`washi-tape z-10 ${className}`} style={{ ["--washi-color" as any]: color }} />
    );
}

// ==========================================
// 3. MAIN PAGE COMPONENT
// ==========================================
export default function MyItineraryPage() {
    const [itineraries, setItineraries] = useState<Itinerary[]>(MOCK_MY_ITINERARIES);
    const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");

    // Lọc danh sách theo Tab
    const filteredItineraries = useMemo(() => {
        const now = new Date();
        return itineraries.filter((iti) => {
            if (activeTab === "all") return true;

            const startDate = new Date(iti.start_date);
            if (activeTab === "upcoming") {
                return startDate >= now; // Sắp tới
            } else {
                return startDate < now; // Đã qua
            }
        });
    }, [itineraries, activeTab]);

    const handleDelete = (id: string) => {
        setItineraries(prev => prev.filter(iti => iti.id !== id));
        toast.success("Đã xóa lộ trình vào thùng rác");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

            {/* --- HERO SECTION TỦ ĐỒ CÁ NHÂN --- */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] font-display">
                            Khu vực cá nhân
                        </span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-main)]">
                        Sổ tay hành trình của tôi
                    </h1>
                    <p className="mt-2 text-[var(--text-muted)] text-sm md:text-base font-medium max-w-xl">
                        Nơi lưu giữ những kế hoạch vi vu và kỉ niệm trên từng chặng đường. Bạn hiện có
                        <strong className="text-[var(--text-main)] mx-1">{itineraries.length}</strong>
                        cuốn sổ tay.
                    </p>
                </div>

                <button onClick={() => toast.success("Mở màn hình tạo mới")} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-gold)] text-white text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0">
                    <Plus className="w-4 h-4" />
                    Bắt đầu hành trình mới
                </button>
            </div>

            {/* --- TABS BỘ LỌC --- */}
            <div className="flex items-center gap-2 mb-8 bg-[var(--bg-card)] border border-[var(--border-color)] p-1.5 rounded-2xl w-fit shadow-sm">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "all" ? "bg-[var(--bg-paper)] text-[var(--text-main)] shadow-sm border border-[var(--border-color)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent"
                        }`}
                >
                    <Compass className="w-4 h-4" /> Tất cả
                </button>
                <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "upcoming" ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" : "text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent"
                        }`}
                >
                    <PlaneTakeoff className="w-4 h-4" /> Sắp khởi hành
                </button>
                <button
                    onClick={() => setActiveTab("past")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "past" ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent"
                        }`}
                >
                    <Archive className="w-4 h-4" /> Đã hoàn thành
                </button>
            </div>

            {/* --- GRID HIỂN THỊ LỘ TRÌNH --- */}
            {filteredItineraries.length === 0 ? (
                <div className="p-16 text-center bg-[var(--bg-card)] border border-dashed border-[var(--border-color)] rounded-[32px]">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[var(--bg-bento)] flex items-center justify-center text-[var(--text-muted)]">
                        <Compass className="w-10 h-10 opacity-40 animate-pulse" />
                    </div>
                    <h3 className="font-display font-bold text-xl mb-2 text-[var(--text-main)]">
                        Chưa có lịch trình nào
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto mb-6">
                        Hãy bắt đầu lên kế hoạch cho chuyến đi tiếp theo của bạn ngay hôm nay.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredItineraries.map((itinerary, index) => (
                            <MyItineraryCard
                                key={itinerary.id}
                                itinerary={itinerary}
                                index={index}
                                onDelete={() => handleDelete(itinerary.id)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

// ==========================================
// 4. MY ITINERARY CARD (Dành riêng cho trang cá nhân)
// ==========================================
function MyItineraryCard({
    itinerary,
    index,
    onDelete
}: {
    itinerary: Itinerary;
    index: number;
    onDelete: () => void;
}) {
    const tilts = [-2, 1.5, -1, 2, -1.5, 1];
    const defaultRotate = tilts[index % tilts.length];
    const washiColors = ["var(--washi-teal)", "var(--washi-coral)", "var(--washi-yellow)"];
    const washiColor = washiColors[index % washiColors.length];

    const isUpcoming = new Date(itinerary.start_date) >= new Date();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, rotate: defaultRotate }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{
                rotate: 0,
                y: -8,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-[24px] shadow-sm hover:shadow-[var(--shadow-float)] transition-all flex flex-col justify-between relative group"
        >
            <WashiTape color={washiColor} className="top-[-8px] left-1/2 -translate-x-1/2 w-28 -rotate-2" />

            {/* Trạng thái Public / Private */}
            <div className="absolute -top-3 -left-3 z-20 w-9 h-9 rounded-2xl flex items-center justify-center shadow-md rotate-[-10deg] border border-[var(--border-color)] bg-[var(--bg-card)]">
                {itinerary.share ? (
                    <Share2 className="w-4 h-4 text-[var(--accent-primary)]" aria-label="Đã Public" />
                ) : (
                    <Lock className="w-4 h-4 text-[var(--text-muted)]" aria-label="Riêng tư" />
                )}
            </div>

            {/* Image Box */}
            <div>
                <div className="relative h-48 w-full rounded-[16px] overflow-hidden bg-slate-100 cursor-pointer">
                    <img
                        src={itinerary.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800'}
                        alt={itinerary.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    <div className="absolute top-3 right-3 z-10">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border backdrop-blur-md flex items-center gap-1.5 ${isUpcoming
                            ? "bg-blue-500/20 text-blue-100 border-blue-400/30"
                            : "bg-emerald-500/20 text-emerald-100 border-emerald-400/30"
                            }`}>
                            {isUpcoming ? <PlaneTakeoff className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
                            {isUpcoming ? "Sắp tới" : "Đã qua"}
                        </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md flex items-center gap-1 border border-white/10">
                            <Clock className="w-3 h-3 text-[var(--accent-gold)]" />
                            {itinerary.days} Ngày {itinerary.nights} Đêm
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="pt-4 cursor-pointer">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] mb-1.5">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(itinerary.start_date).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-[var(--accent-gold)] font-bold">
                            {itinerary.estimated_cost?.toLocaleString('vi-VN')} đ
                        </span>
                    </div>

                    <h3 className="font-display font-bold text-lg leading-tight group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2 mt-1">
                        {itinerary.title}
                    </h3>

                    <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                        {itinerary.itinerary_provinces?.map(p => p.provinces?.name).join(', ') || 'Chưa cập nhật'}
                    </p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 pt-3.5 border-t border-[var(--border-color)] flex items-center justify-between relative">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-paper)] px-2 py-0.5 rounded-md">
                    {itinerary.theme}
                </span>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => toast("Tính năng chỉnh sửa", { icon: "✍️" })}
                        className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-paper)] transition-colors"
                        title="Chỉnh sửa lộ trình"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>

                    {/* Menu xóa */}
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Xóa lộ trình"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}