"use client";
import React, { useEffect, useRef, useState } from "react";
import {
    Save, Calendar, DollarSign, MapPin,
    Plus, Trash2, Search, Filter, Map,
    X, ArrowLeft, Sparkles, Compass, CheckCircle2, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Province, Itinerary } from "@/interface";
import { toast } from "react-hot-toast";

export default function ItineraryBuilderPage() {
    // === 1. QUẢN LÝ LUỒNG (STEPS) ===
    const [step, setStep] = useState<"SETUP" | "BUILDER">("SETUP");

    // === 2. STATE CHO MÀN HÌNH SETUP ===
    const [searchProvince, setSearchProvince] = useState("");
    const [selectedProvinces, setSelectedProvinces] = useState<{ id: string, name: string }[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [provincesData, setProvincesData] = useState<Province[]>([]);

    // Lưu danh sách Lộ trình mẫu (từ API)
    const [templates, setTemplates] = useState<Itinerary[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Quản lý cuộn trang (Infinite Scroll)
    const [visibleCount, setVisibleCount] = useState(3);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    // === 3. STATE CHO MÀN HÌNH BUILDER ===
    const [currentItinerary, setCurrentItinerary] = useState({
        title: "", startDate: "", endDate: "", theme: ""
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [days, setDays] = useState<any[]>([]);

    // === 4. FETCH DATA TỪ API ===
    const fetchProvinces = async () => {
        try {
            const response = await fetch("http://localhost:8000/provinces");
            const result = await response.json();

            if (result.success && result.data) {
                setProvincesData(result.data);
            } else if (Array.isArray(result)) {
                setProvincesData(result);
            }
        } catch (error) {
            console.error("Error fetching provinces:", error);
            toast.error("Không thể tải danh sách tỉnh/thành phố.");
        }
    }

    const fetchItineraryData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:8000/itineraries`);
            const result = await response.json();

            if (result.success && result.data) {
                setTemplates(result.data); // Gán vào biến templates thay vì itinerary
            }
        } catch (error) {
            console.error("Error fetching itinerary data:", error);
            toast.error("Không thể tải dữ liệu lộ trình mẫu.");
        } finally {
            setIsLoading(false);
        }
    };

    // Khởi tạo data lần đầu
    useEffect(() => {
        setTimeout(() => {
            fetchProvinces();
            fetchItineraryData();
        }, 0);
    }, []);

    // Hook theo dõi thao tác cuộn (Infinite Scroll)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setTimeout(() => setVisibleCount((prev) => prev + 3), 500);
                }
            },
            { root: null, rootMargin: "20px", threshold: 0 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [step, visibleCount, templates.length]);

    // === 5. CÁC HÀM XỬ LÝ SỰ KIỆN ===
    const handleSelectProvince = (province: { id: string, name: string }) => {
        if (!selectedProvinces.find(p => p.id === province.id)) {
            setSelectedProvinces([...selectedProvinces, province]);
        }
        setSearchProvince("");
        setIsDropdownOpen(false);
    };

    const handleRemoveProvince = (id: string) => {
        setSelectedProvinces(selectedProvinces.filter(p => p.id !== id));
    };

    const calculateTotalCost = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return days.reduce((total, day) => total + (day.locations?.reduce((sum: number, loc: any) => sum + (loc.cost || 0), 0) || 0), 0);
    };

    // Lọc tỉnh thành cho thanh tìm kiếm
    const filteredProvinces = provincesData?.filter(province =>
        province.name.toLowerCase().includes(searchProvince.toLowerCase()) &&
        !selectedProvinces.some(selected => selected.id === province.id)
    );

    // ==========================================
    // GIAO DIỆN 1: MÀN HÌNH SETUP
    // ==========================================
    if (step === "SETUP") {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-12 font-sans flex flex-col items-center justify-start">
                <div className="w-full max-w-4xl text-center mb-12 mt-10">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 mb-6 font-semibold text-sm">
                        <Sparkles className="h-4 w-4" /> Bắt đầu hành trình mới
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                        Bạn muốn đi đâu?
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-500 dark:text-gray-400 text-lg">
                        Hãy chọn một hoặc nhiều tỉnh thành, hoặc bắt đầu nhanh bằng một lộ trình mẫu.
                    </motion.p>
                </div>

                {/* --- KHUNG TÌM KIẾM --- */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 mb-16 flex flex-col md:flex-row gap-4 items-center relative">
                    <div className="flex flex-wrap items-center gap-2 p-2 min-h-[60px] bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all w-full md:flex-1">
                        <Search className="h-5 w-5 text-gray-400 ml-2 shrink-0" />

                        {selectedProvinces.map(p => (
                            <span key={p.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-600">
                                {p.name}
                                <button onClick={() => handleRemoveProvince(p.id)} className="text-gray-400 hover:text-red-500 transition-colors"><X className="h-3.5 w-3.5" /></button>
                            </span>
                        ))}

                        <input
                            type="text"
                            placeholder={selectedProvinces.length === 0 ? "Tìm kiếm tỉnh thành (VD: Hà Nội, Đà Lạt...)" : "Thêm điểm đến..."}
                            value={searchProvince}
                            onChange={(e) => {
                                setSearchProvince(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                            className="flex-1 min-w-[200px] bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 font-medium border-0 border-transparent focus:border-transparent outline-none focus:outline-none ring-0 focus:ring-0 shadow-none focus:shadow-none"
                        />
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 md:right-48 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {filteredProvinces && filteredProvinces.length > 0 ? (
                                    filteredProvinces.map((province) => (
                                        <button
                                            key={province.id}
                                            onClick={() => handleSelectProvince({ id: province.id, name: province.name })}
                                            className="w-full text-left px-4 py-3 flex items-center hover:bg-brand-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200 font-medium transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-none focus:bg-brand-50 focus:outline-none"
                                        >
                                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                            {province.name}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-4 text-center text-sm text-gray-500">
                                        Không tìm thấy tỉnh/thành nào phù hợp.
                                    </div>
                                )}
                            </div>
                            {filteredProvinces && filteredProvinces.length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-100 dark:border-gray-800">
                                    Nhấn để chọn tỉnh thành vào lộ trình
                                </div>
                            )}
                        </div>
                    )}
                    <button
                        onClick={() => setStep("BUILDER")}
                        className="w-full md:w-auto shrink-0 bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        Tạo Lộ Trình <ChevronRight className="h-5 w-5" />
                    </button>
                </motion.div>

                {/* --- DANH SÁCH LỘ TRÌNH MẪU --- */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full max-w-6xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Compass className="text-brand-500" /> Hoặc chọn Lộ trình mẫu
                        </h2>
                        <button className="text-brand-600 dark:text-brand-400 font-semibold text-sm hover:underline">Xem tất cả</button>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                                Đang tải dữ liệu...
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {templates.slice(0, visibleCount).map((tpl) => (
                                <div
                                    key={tpl.id}
                                    onClick={() => {
                                        // Điền dữ liệu từ template vào form đang soạn và chuyển trang
                                        setCurrentItinerary({
                                            title: tpl.title || "",
                                            theme: tpl.theme || "",
                                            startDate: "",
                                            endDate: ""
                                        });
                                        // 🛠️ [NOTE CHO DEV]: Gọi API lấy chi tiết days của tpl.id rồi gán vào setDays() tại đây
                                        setStep("BUILDER");
                                    }}
                                    className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 hover:border-brand-300 dark:hover:border-brand-700 flex flex-row h-32 sm:h-36"
                                >
                                    <div className="w-32 sm:w-48 overflow-hidden relative shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={tpl.image_url} alt={tpl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-2 left-2 flex flex-wrap gap-1 pr-2">
                                            <span className="bg-brand-500/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                                {tpl.theme || "Du lịch"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col flex-1 justify-between min-w-0">
                                        <div>
                                            <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors line-clamp-2 leading-tight">
                                                {tpl.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 truncate">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                Lộ trình mẫu
                                            </p>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-2">
                                            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium hidden sm:inline">Chi phí dự kiến:</span>
                                            <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-md text-sm ml-auto">
                                                {tpl.estimated_cost?.toLocaleString('vi-VN')}đ
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Điểm neo cho Infinite Scroll */}
                            {visibleCount < templates.length && (
                                <div ref={loaderRef} className="py-6 flex justify-center items-center w-full">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse font-medium">
                                        <div className="h-4 w-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
                                        Đang tải thêm lộ trình...
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    // ==========================================
    // GIAO DIỆN 2: TRÌNH THIẾT KẾ LỘ TRÌNH (BUILDER)
    // ==========================================
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
                        <div className="py-8 text-center text-sm text-gray-400">
                            Danh sách địa điểm sẽ hiển thị tại đây...
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}