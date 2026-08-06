"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, MapPin, Calendar, Wallet, Star,
    SlidersHorizontal, ChevronRight, Heart,
    TrendingUp, Compass, Users, CheckCircle2
} from "lucide-react";

// --- MOCK DATA ĐƯỢC LÀM PHONG PHÚ HƠN ---
const MOCK_TRIPS = [
    {
        id: 1,
        title: "Khám phá Sapa Mù Sương & Bản Cát Cát",
        location: "Sapa, Lào Cai",
        theme: "Núi rừng",
        days: 3,
        cost: 3200000,
        rating: 4.8,
        reviews: 124,
        author: {
            name: "TravelBug VN",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
        },
        image: "https://images.unsplash.com/photo-1542013897-440266023223?q=80&w=800&auto=format&fit=crop",
        description: "Hành trình 3 ngày 2 đêm thư giãn tại Sapa, săn mây trên đỉnh Fansipan và thưởng thức đặc sản nướng bản địa cực kỳ hấp dẫn.",
        tags: ["Trekking", "Săn mây", "Đặc sản"],
        difficulty: "Dễ"
    },
    {
        id: 2,
        title: "Hành trình di sản Hội An - Mỹ Sơn",
        location: "Quảng Nam",
        theme: "Văn hóa",
        days: 2,
        cost: 1500000,
        rating: 4.9,
        reviews: 89,
        author: {
            name: "Heritage Explorer",
            avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop"
        },
        image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop",
        description: "Đạp xe quanh phố cổ, thả đèn hoa đăng và đón bình minh tại thánh địa Mỹ Sơn cổ kính với hướng dẫn viên chuyên nghiệp.",
        tags: ["Đạp xe", "Lịch sử", "Gia đình"],
        difficulty: "Dễ"
    },
    {
        id: 3,
        title: "Camping Hồ Trị An cuối tuần",
        location: "Đồng Nai",
        theme: "Cắm trại",
        days: 2,
        cost: 800000,
        rating: 4.5,
        reviews: 42,
        author: {
            name: "Weekend Chill",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
        },
        image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=800&auto=format&fit=crop",
        description: "Rời xa khói bụi thành phố, chèo SUP trên mặt hồ phẳng lặng và nướng BBQ dưới bầu trời đầy sao lung linh.",
        tags: ["Chèo SUP", "BBQ", "Thiên nhiên"],
        difficulty: "Trung bình"
    }
];

const THEMES = ["Biển đảo", "Núi rừng", "Văn hóa", "Cắm trại", "Chữa lành"];
const PRICE_RANGES = [
    { id: "all", label: "Tất cả mức giá" },
    { id: "low", label: "Dưới 2 triệu" },
    { id: "mid", label: "2 - 5 triệu" },
    { id: "high", label: "Trên 5 triệu" }
];

export default function ExploreItinerariesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState("all");
    const [savedTrips, setSavedTrips] = useState<number[]>([]);

    const handleThemeToggle = (theme: string) => {
        setSelectedThemes(prev =>
            prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
        );
    };

    const toggleSave = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedTrips(prev =>
            prev.includes(id) ? prev.filter(tripId => tripId !== id) : [...prev, id]
        );
    };

    // Lọc data đơn giản
    const filteredTrips = useMemo(() => {
        return MOCK_TRIPS.filter(trip => {
            const matchSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                trip.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchTheme = selectedThemes.length === 0 || selectedThemes.includes(trip.theme);
            return matchSearch && matchTheme;
        });
    }, [searchQuery, selectedThemes]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">

            {/* HERO SECTION VỚI BACKGROUND & FLOATING SEARCH */}
            <div className="relative bg-emerald-700 h-[320px] flex items-center justify-center px-4 sm:px-6 lg:px-8">
                {/* Background Pattern/Overlay */}
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
                        alt="Hero Background"
                        className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/80"></div>
                </div>

                <div className="relative z-10 w-full max-w-4xl text-center mt-[-40px]">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                            Khám phá thế giới theo cách của bạn
                        </h1>
                        <p className="text-emerald-100 text-lg md:text-xl font-medium mb-8">
                            Hàng ngàn lộ trình độc đáo được thiết kế bởi cộng đồng đam mê xê dịch
                        </p>
                    </motion.div>

                    {/* BỘ TÌM KIẾM NỔI (FLOATING SEARCH BAR) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="absolute left-0 right-0 -bottom-24 bg-white p-3 md:p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-3 max-w-3xl mx-auto"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Bạn muốn đi đâu? (VD: Đà Lạt, Sapa...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-700 font-medium text-lg placeholder:text-slate-400"
                            />
                        </div>
                        <button className="px-8 py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-lg">
                            <Compass className="w-5 h-5" /> Tìm chuyến đi
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* MAIN LAYOUT */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 flex flex-col lg:flex-row gap-8">

                {/* SIDEBAR FILTER */}
                <aside className="w-full lg:w-72 shrink-0">
                    <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-lg text-slate-800">Bộ lọc</h3>
                            </div>
                            {(selectedThemes.length > 0 || priceRange !== 'all') && (
                                <button
                                    onClick={() => { setSelectedThemes([]); setPriceRange('all'); }}
                                    className="text-sm text-emerald-600 font-medium hover:underline"
                                >
                                    Xóa lọc
                                </button>
                            )}
                        </div>

                        {/* Filter: Chủ đề (Dạng Badge/Pills) */}
                        <div>
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-slate-400" /> Phong cách
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {THEMES.map(theme => (
                                    <button
                                        key={theme}
                                        onClick={() => handleThemeToggle(theme)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedThemes.includes(theme)
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {theme}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter: Mức giá */}
                        <div>
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-slate-400" /> Ngân sách dự kiến
                            </h4>
                            <div className="space-y-3">
                                {PRICE_RANGES.map(range => (
                                    <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${priceRange === range.id
                                                ? 'border-emerald-600'
                                                : 'border-slate-300 group-hover:border-emerald-400'
                                            }`}>
                                            {priceRange === range.id && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />}
                                        </div>
                                        <span className={`text-sm font-medium ${priceRange === range.id ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {range.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* DANH SÁCH LỘ TRÌNH (HORIZONTAL CARDS) */}
                <main className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-slate-500 font-medium">
                            Tìm thấy <span className="text-emerald-600 font-bold text-lg">{filteredTrips.length}</span> lộ trình
                        </p>
                        <select className="bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2 px-4 rounded-xl outline-none cursor-pointer focus:border-emerald-500">
                            <option>Đề xuất cho bạn</option>
                            <option>Đánh giá cao nhất</option>
                            <option>Giá thấp nhất</option>
                        </select>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence>
                            {filteredTrips.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-center py-20 bg-white rounded-3xl border border-slate-200"
                                >
                                    <Compass className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy lộ trình</h3>
                                    <p className="text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc để xem thêm kết quả nhé.</p>
                                </motion.div>
                            ) : (
                                filteredTrips.map((trip, index) => (
                                    <motion.div
                                        key={trip.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                        className="group flex flex-col md:flex-row bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-200 transition-all duration-300 cursor-pointer"
                                    >
                                        {/* IMAGE SECTION */}
                                        <div className="md:w-80 h-64 md:h-auto relative overflow-hidden shrink-0">
                                            <img
                                                src={trip.image}
                                                alt={trip.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                            />
                                            {/* Overlays */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent"></div>

                                            <button
                                                onClick={(e) => toggleSave(trip.id, e)}
                                                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-emerald-500 transition-colors z-10"
                                            >
                                                <Heart className={`w-5 h-5 ${savedTrips.includes(trip.id) ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                                            </button>

                                            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
                                                <Compass className="w-3.5 h-3.5 text-emerald-600" /> {trip.theme}
                                            </div>

                                            {/* Tác giả nổi trên ảnh */}
                                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                                <img src={trip.author.avatar} alt="Author" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                                                <span className="text-white text-sm font-medium text-shadow-sm">{trip.author.name}</span>
                                            </div>
                                        </div>

                                        {/* CONTENT SECTION */}
                                        <div className="p-6 md:p-7 flex flex-col flex-1">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" /> {trip.location}
                                                    </p>
                                                    <h3 className="text-2xl font-bold text-slate-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                                        {trip.title}
                                                    </h3>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0 ml-4">
                                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1.5 rounded-xl text-sm font-bold border border-amber-100">
                                                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                                        {trip.rating}
                                                    </div>
                                                    <span className="text-xs text-slate-500 mt-1 font-medium hover:underline">
                                                        {trip.reviews} đánh giá
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                                                {trip.description}
                                            </p>

                                            {/* Tags & Difficulty */}
                                            <div className="flex items-center gap-2 mb-6 flex-wrap">
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                    <CheckCircle2 className="w-3 h-3 text-slate-400" /> {trip.difficulty}
                                                </span>
                                                {trip.tags.map(tag => (
                                                    <span key={tag} className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Footer Card */}
                                            <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between pt-5 border-t border-slate-100 gap-4">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2 text-slate-700">
                                                        <div className="p-2 bg-emerald-50 rounded-lg">
                                                            <Calendar className="w-4 h-4 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Thời gian</p>
                                                            <p className="text-sm font-bold">{trip.days} Ngày</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-700">
                                                        <div className="p-2 bg-emerald-50 rounded-lg">
                                                            <Wallet className="w-4 h-4 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Chi phí</p>
                                                            <p className="text-sm font-bold text-emerald-600">~{trip.cost.toLocaleString('vi-VN')}đ</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl group-hover:bg-emerald-600 transition-colors w-full sm:w-auto">
                                                    Xem chi tiết <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Nút Load More */}
                    {filteredTrips.length > 0 && (
                        <div className="mt-12 flex justify-center">
                            <button className="px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center gap-2">
                                Tải thêm lộ trình <TrendingUp className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}