/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
    Compass,
    Plus,
    PlaneTakeoff,
    Archive
} from "lucide-react";
import toast from "react-hot-toast";
import { Itinerary } from "@/interface";
import { MyItineraryCard } from "@/components/user/MyItinerary/MyItineraryCard";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/hooks/auth/AuthContext";
const MOCK_MY_ITINERARIES: Itinerary[] = [
    {
        id: "iti-1",
        title: "Đà Lạt 3 Ngày - Trốn phố về rừng",
        summary: "Chuyến đi chữa lành ngắm hoàng hôn và săn mây đồi Đa Phú",
        start_date: "2026-08-15T00:00:00.000Z",
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

export default function MyItineraryPage() {
    const [itineraries, setItineraries] = useState<Itinerary[]>(MOCK_MY_ITINERARIES);
    const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");
    const filteredItineraries = useMemo(() => {
        const now = new Date();
        return itineraries.filter((iti) => {
            if (activeTab === "all") return true;
            const startDate = new Date(iti.start_date);
            if (activeTab === "upcoming") {
                return startDate >= now;
            } else {
                return startDate < now;
            }
        });
    }, [itineraries, activeTab]);
    const handleDelete = (id: string) => {
        setItineraries(prev => prev.filter(iti => iti.id !== id));
        toast.success("Đã xóa lộ trình vào thùng rác");
    };
    const { user: currentUser } = useAuth();

    const fetchMyItineraries = async () => {
        try {
            const { data, response } = await api.get('/itineraries/me');
            if (!response.ok) {
                throw new Error("Failed to fetch itineraries");
            }
            if (data.userId !== currentUser?.id) {
                toast.error("Bạn không có quyền truy cập vào lộ trình này");
            }
            const my_itineraries: Itinerary[] = data?.data?.data || data?.data || data || [];
            setItineraries(my_itineraries);
        } catch (error) {
            console.error("Error fetching itineraries:", error);
        }
    }
    useEffect(() => {
        fetchMyItineraries();
    }, [])
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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