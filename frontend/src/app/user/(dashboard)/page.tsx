/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Compass,
    MapPin,
    Sparkles,
    TrendingUp,
    ChevronRight,
    Heart,
    Clock,
    X,
    Award,
    Compass as CompassIcon,
    Edit3,
    Clock as ClockIcon,
    Image as ImageIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import confetti from "canvas-confetti";
import { Itinerary, Itinerary_days, Itinerary_locations, Location, User } from "@/interface";
import { api } from "@/lib/apiClient";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useAuth } from "@/hooks/auth/AuthContext";
import { UserBanner } from "@/components/user/HomePage/UserBanner";
import { TrendingCard } from "@/components/user/HomePage/TrendingCard";
import { TripDetailModal } from "@/components/modals/user/TripDetailModal";


interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: string;
}

interface Region {
    name: string;
    image: string;
    count: number;
    color: string;
}

interface BlogTip {
    title: string;
    image: string;
    tag: string;
    readTime: string;
}

// ============== CONSTANTS ==============
const StarIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg
        className={className}
        style={style}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const REGIONS: Region[] = [
    {
        name: "Miền Bắc",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=600&auto=format&fit=crop",
        count: 24,
        color: "from-rose-500 to-amber-500",
    },
    {
        name: "Miền Trung",
        image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=600&auto=format&fit=crop",
        count: 18,
        color: "from-emerald-500 to-teal-500",
    },
    {
        name: "Miền Nam",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=600&auto=format&fit=crop",
        count: 30,
        color: "from-orange-500 to-yellow-500",
    },
    {
        name: "Tây Nguyên",
        image: "https://images.unsplash.com/photo-1599707367077-ca3e5c2e9a9c?q=80&w=600&auto=format&fit=crop",
        count: 12,
        color: "from-purple-500 to-indigo-500",
    },
];

const BLOG_TIPS: BlogTip[] = [
    {
        title: "Cẩm nang du lịch Phú Quốc tự túc 2026",
        image: "https://images.unsplash.com/photo-1570106393587-5d3f2a3b1b8c?q=80&w=600&auto=format&fit=crop",
        tag: "Biển đảo",
        readTime: "5 phút",
    },
    {
        title: "8 quán cà phê check-in đẹp nhất Đà Lạt",
        image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600&auto=format&fit=crop",
        tag: "Sống ảo",
        readTime: "4 phút",
    },
    {
        title: "Kinh nghiệm trekking Tà Xùa mùa lúa chín",
        image: "https://images.unsplash.com/photo-1518546305927-5a4bbfe3a78a?q=80&w=600&auto=format&fit=crop",
        tag: "Trekking",
        readTime: "7 phút",
    },
];

// ============== UTILITY FUNCTIONS ==============
function triggerConfetti() {
    confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#FF5A36", "#0EA5E9", "#10B981", "#F59E0B"],
    });
}

function notify(
    msg: string,
    icon: string = "✨",
    type: "default" | "success" = "default"
) {
    toast(
        <div className="flex items-center gap-2.5 font-medium text-sm">
            <span className="text-lg">{icon}</span>
            <span>{msg}</span>
        </div>,
        {
            style: {
                borderRadius: "16px",
                background: "var(--bg-card)",
                color: "var(--text-main)",
                border: "1px solid var(--border-color)",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                padding: "12px 16px",
            },
        }
    );
}


function StarRating({ rating, maxStars = 5, size = "w-5 h-5" }: StarRatingProps) {
    return (
        <div className="flex items-center gap-1">
            {[...Array(maxStars)].map((_, index) => {
                const fillPercentage = Math.max(0, Math.min(100, (rating - index) * 100));

                return (
                    <div key={index} className={`relative ${size}`}>
                        <StarIcon className={`${size} text-gray-300 absolute top-0 left-0`} />
                        <StarIcon
                            className={`${size} text-yellow-400 absolute top-0 left-0`}
                            style={{
                                clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`,
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}

// ============== NAVIGATION ITEMS ==============


// ============== MAIN USER-FRIENDLY COMPONENT ==============
export default function JournifyUserDashboard() {
    const [theme, setTheme] = useState<"day" | "night">("day");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeNav, setActiveNav] = useState("dashboard");
    const [itineraries, setItineraries] = useState<Itinerary[]>([]);
    const [trendingItineraries, setTrendingItineraries] = useState<Itinerary[]>([]);
    const [wishlist, setWishlist] = useState<Location[]>([]);
    const [activeTripDetail, setActiveTripDetail] = useState<Itinerary | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isCreatingTrip, setIsCreatingTrip] = useState(false);
    const [filterRegion, setFilterRegion] = useState<string>("all");
    const [filterDuration, setFilterDuration] = useState<string>("all");
    const [filterBudget, setFilterBudget] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"date" | "budget" | "title">("date");
    const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");

    const { user: currentUser } = useAuth();


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchItineraries = async () => {
        try {
            const { data, response } = await api.get('/itineraries?trending=weekly');
            if (!response.ok) throw new Error(data.message || "Lỗi khi lấy dữ liệu");
            const itineraries_data: Itinerary[] = data?.data?.data || data?.data || data || [];
            setItineraries(itineraries_data);
            const trending = itineraries_data.filter(i => i.share).slice(0, 3);
            setTrendingItineraries(trending.length > 0 ? trending : itineraries_data.slice(0, 3));
        } catch (error: any) {
            notify(error.message || "Không thể tải dữ liệu", "⚠️");
        }
    };

    const fetchFavLocations = async () => {
        try {
            const { data, response } = await api.get('/locations?trending=true&limit=4');
            if (!response.ok) throw new Error(data.message || "Lỗi khi lấy dữ liệu");
            const favor_locations: Location[] = data?.data?.data || data?.data || data || [];
            setWishlist(favor_locations);
        } catch (error: any) {
            notify(error.message || "Không thể tải dữ liệu", "⚠️");
        }
    }

    useEffect(() => {
        fetchItineraries();
        fetchFavLocations()
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("theme-night", theme === "night");
    }, [theme]);

    const filteredItineraries = useMemo(() => {
        const result = itineraries.filter((iti) => {
            const matchesSearch =
                iti.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                iti.itinerary_provinces?.some(p => p.provinces?.name.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesRegion =
                filterRegion === "all" ||
                iti.itinerary_provinces?.some(p => p.provinces?.name === filterRegion);
            const matchesDuration =
                filterDuration === "all" ||
                (filterDuration === "short" && (iti.days || 0) <= 3) ||
                (filterDuration === "medium" && (iti.days || 0) > 3 && (iti.days || 0) <= 5) ||
                (filterDuration === "long" && (iti.days || 0) > 5);
            const matchesBudget =
                filterBudget === "all" ||
                (filterBudget === "low" && (iti.estimated_cost || 0) < 2000000) ||
                (filterBudget === "medium" && (iti.estimated_cost || 0) >= 2000000 && (iti.estimated_cost || 0) < 5000000) ||
                (filterBudget === "high" && (iti.estimated_cost || 0) >= 5000000);
            return matchesSearch && matchesRegion && matchesDuration && matchesBudget;
        });

        switch (sortBy) {
            case "date":
                result.sort((a, b) => (a.start_date ? new Date(a.start_date).getTime() : 0) - (b.start_date ? new Date(b.start_date).getTime() : 0));
                break;
            case "budget":
                result.sort((a, b) => (a.estimated_cost || 0) - (b.estimated_cost || 0));
                break;
            case "title":
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        return result;
    }, [itineraries, searchQuery, filterRegion, filterDuration, filterBudget, sortBy]);

    const handleCloneTrip = (iti: Itinerary) => {
        triggerConfetti();
        const cloned: Itinerary = {
            ...iti,
            id: `cloned-${Date.now()}`,
            title: `${iti.title} (Bản sao)`,
            share: false,
        };
        setItineraries([cloned, ...itineraries]);
        notify(`Đã lưu "${iti.title}" vào sổ tay của bạn!`, "📌");
    };

    const toggleLike = (id: string) => notify("Đã thêm vào danh sách yêu thích!", "❤️");
    const removeWishlist = (id: string) => {
        setWishlist((prev) => prev.filter((item) => item.id !== id));
        notify("Đã xóa khỏi Wishlist", "🗑️");
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = itineraries.findIndex((i) => i.id === active.id);
            const newIndex = itineraries.findIndex((i) => i.id === over.id);
            setItineraries((items) => arrayMove(items, oldIndex, newIndex));
        }
    };

    // Personal stats tính toán nhanh
    const personalStats = useMemo(() => {
        return {
            totalTrips: itineraries.length,
            totalWishlist: wishlist.length,
            totalCloned: itineraries.filter(i => i.title.includes("Bản sao")).length,
            totalPlaces: itineraries.reduce((acc, i) => acc + (i.itinerary_days?.reduce((a, d) => a + d.itinerary_locations.length, 0) || 0), 0),
        };
    }, [itineraries, wishlist]);

    return (
        <div className="min-h-screen bg-[var(--bg-paper)] text-[var(--text-main)] transition-colors selection:bg-[var(--accent-primary)] selection:text-white">
            <Toaster position="top-right" />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-20 md:pb-10">
                {activeNav === "dashboard" && (
                    <div className="space-y-12 md:space-y-16">
                        <UserBanner
                            currentUser={currentUser}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            setIsAiModalOpen={setIsAiModalOpen}
                        />
                        {/* Lộ trình nổi bật */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                                        <TrendingUp className="w-6 h-6 text-[var(--accent-primary)]" /> Lộ trình nổi bật
                                    </h2>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">Được cộng đồng yêu thích nhất tuần này</p>
                                </div>
                                <button
                                    onClick={() => setActiveNav("trips")}
                                    className="text-sm font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                                >
                                    Xem tất cả <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {trendingItineraries.map((trip, idx) => (
                                    <TrendingCard
                                        key={trip.id}
                                        trip={trip}
                                        rank={idx + 1}
                                        onOpen={() => setActiveTripDetail(trip)}
                                        onClone={() => handleCloneTrip(trip)}
                                    />
                                ))}
                                {trendingItineraries.length === 0 && (
                                    <div className="col-span-full text-center py-10 text-[var(--text-muted)]">
                                        <Compass className="w-10 h-10 mx-auto opacity-30 mb-2" />
                                        <p>Chưa có lộ trình nổi bật. Hãy là người đầu tiên chia sẻ!</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Khám phá theo vùng miền */}
                        <section>
                            <div className="mb-6">
                                <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-rose-500" /> Khám phá theo vùng miền
                                </h2>
                                <p className="text-sm text-[var(--text-muted)] mt-1">Chọn một vùng đất để bắt đầu hành trình</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {REGIONS.map((region) => (
                                    <motion.div
                                        key={region.name}
                                        whileHover={{ y: -5 }}
                                        className="relative rounded-2xl overflow-hidden h-40 md:h-48 cursor-pointer group shadow-sm"
                                        onClick={() => {
                                            setFilterRegion(region.name);
                                            setActiveNav("trips");
                                        }}
                                    >
                                        <img src={region.image} alt={region.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                            <h3 className="font-bold text-lg">{region.name}</h3>
                                            <p className="text-xs opacity-80">{region.count} lộ trình</p>
                                        </div>
                                        <div className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br ${region.color} opacity-90 shadow-lg`} />
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Bài viết & Mẹo du lịch */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                                        <Edit3 className="w-6 h-6 text-purple-500" /> Bài viết & Mẹo du lịch
                                    </h2>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">Cẩm nang bỏ túi cho chuyến đi của bạn</p>
                                </div>
                                <button
                                    onClick={() => notify("Chuyên mục Blog đang được xây dựng", "📝")}
                                    className="text-sm font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                                >
                                    Xem thêm <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {BLOG_TIPS.map((blog, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                                        onClick={() => notify(`Đọc bài: ${blog.title}`, "📖")}
                                    >
                                        <div className="relative h-44 overflow-hidden">
                                            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                                                {blog.tag}
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-base leading-snug line-clamp-2">{blog.title}</h4>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" /> {blog.readTime} đọc
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-[var(--accent-primary)]" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Thống kê cá nhân & Wishlist nhỏ */}
                        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Thống kê nhẹ nhàng */}
                            <div className="lg:col-span-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-[var(--accent-gold)]" /> Hành trình của bạn
                                </h3>
                                {currentUser ? (
                                    <>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[var(--text-muted)]">Lộ trình đã lưu</span>
                                                <span className="font-bold text-lg">{personalStats.totalTrips}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[var(--text-muted)]">Điểm yêu thích</span>
                                                <span className="font-bold text-lg">{personalStats.totalWishlist}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[var(--text-muted)]">Đã clone</span>
                                                <span className="font-bold text-lg">{personalStats.totalCloned}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[var(--text-muted)]">Địa điểm đã thêm</span>
                                                <span className="font-bold text-lg">{personalStats.totalPlaces}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveNav("trips")}
                                            className="mt-6 w-full py-2.5 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm font-bold hover:bg-[var(--accent-primary)] hover:text-white transition"
                                        >
                                            Quản lý lộ trình
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center py-6 text-[var(--text-muted)]">
                                        <Award className="w-8 h-8 mx-auto opacity-30 mb-2" />
                                        <p className="text-sm">Đăng nhập để xem thống kê cá nhân.</p>
                                    </div>
                                )}


                            </div>

                            {/* Wishlist preview */}
                            <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-display text-lg font-bold flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-rose-500" /> Các điểm đến được yêu thích
                                    </h3>
                                    <button
                                        onClick={() => setActiveNav("wishlist")}
                                        className="text-sm font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                                    >
                                        Xem tất cả <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                {wishlist.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {wishlist.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => notify(`Khám phá ${item.name}`, "🗺️")}
                                                className="flex gap-3 p-2 rounded-xl hover:bg-[var(--bg-paper)] transition cursor-pointer"
                                            >
                                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                                                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold truncate">{item.name}</h4>
                                                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
                                                        <MapPin className="w-3 h-3" /> {item.provinces?.name}
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-2">
                                                        <StarRating rating={item.rating || 0} size="w-4 h-4" />
                                                        <span className="text-sm text-gray-500 font-medium">{item.rating} / 5.0</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-[var(--text-muted)]">
                                        <Heart className="w-8 h-8 mx-auto opacity-30 mb-2" />
                                        <p className="text-sm">Chưa có điểm yêu thích. Hãy thêm ngay!</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => setIsAiModalOpen(true)}
                                    className="mt-4 w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-sm font-bold hover:bg-rose-500 hover:text-white transition flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" /> Gợi ý điểm đến bằng AI
                                </button>
                            </div>
                        </section>

                        {/* Gợi ý từ AI (Call to Action) */}
                        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-gold)]/10 p-8 md:p-10 border border-[var(--border-color)] shadow-sm">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex-1">
                                    <h2 className="font-display text-2xl font-bold flex items-center gap-2 mb-2">
                                        <Sparkles className="w-6 h-6 text-[var(--accent-gold)]" /> Bạn chưa có ý tưởng?
                                    </h2>
                                    <p className="text-sm text-[var(--text-muted)] max-w-md">
                                        Hãy để AI tạo lộ trình cá nhân hóa dựa trên sở thích, ngân sách và thời gian của bạn chỉ trong vài giây.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsAiModalOpen(true)}
                                    className="px-6 py-3 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-gold)] text-white font-bold shadow-lg hover:opacity-90 transition whitespace-nowrap"
                                >
                                    Tạo lộ trình với AI
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {/* Modals (giữ nguyên) */}
            <AnimatePresence>
                {activeTripDetail && (
                    <TripDetailModal currentUser={currentUser} itinerary={activeTripDetail} onClose={() => setActiveTripDetail(null)} onClone={() => handleCloneTrip(activeTripDetail)} />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isCreatingTrip && (
                    <CreateTripModal currentUser={currentUser} onClose={() => setIsCreatingTrip(false)} onSuccess={(trip) => { setItineraries([trip, ...itineraries]); setIsCreatingTrip(false); notify("Đã tạo lộ trình mới thành công!", "✅", "success"); }} />
                )}
            </AnimatePresence>
        </div>
    );
}




function CreateTripModal({ onClose, onSuccess, currentUser }: { onClose: () => void; onSuccess: (trip: Itinerary) => void; currentUser: User | null }) {
    const [title, setTitle] = useState("");
    const [destination, setDestination] = useState("");
    const [days, setDays] = useState(3);
    const [budget, setBudget] = useState(3000000);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [theme, setTheme] = useState("Khám phá");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !destination.trim()) { notify("Vui lòng điền đầy đủ thông tin", "⚠️"); return; }
        const newTrip: Itinerary = { id: `manual-${Date.now()}`, title, summary: `Lộ trình ${days} ngày tại ${destination}`, start_date: startDate?.toISOString() || new Date().toISOString(), end_date: startDate ? new Date(startDate.getTime() + days * 86400000).toISOString() : new Date(Date.now() + days * 86400000).toISOString(), theme: theme, days: days, nights: days - 1, estimated_cost: budget, image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop", share: false, user_id: { name: currentUser?.name ?? "", avatar: currentUser?.avatar ?? "", id: "", email: "", role: "USER", status: "active", created_at: "", itineraries: [], phone_number: 0 }, itinerary_provinces: [{ provinces: { name: destination, id: "" } }], itinerary_days: [] };
        onSuccess(newTrip);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl z-10">
                <div className="flex items-center justify-between mb-5"><h3 className="font-display text-xl font-bold">Tạo lộ trình mới</h3><button onClick={onClose} className="p-1.5 rounded-full hover:bg-[var(--bg-paper)] text-[var(--text-muted)]"><X className="w-5 h-5" /></button></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">Tên lộ trình *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm outline-none focus:border-[var(--accent-primary)]" required /></div>
                    <div><label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">Điểm đến *</label><input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm outline-none focus:border-[var(--accent-primary)]" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">Số ngày</label><input type="number" min={1} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm outline-none focus:border-[var(--accent-primary)]" /></div>
                        <div><label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">Ngân sách (VNĐ)</label><input type="number" min={0} step={100000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm outline-none focus:border-[var(--accent-primary)]" /></div>
                    </div>
                    <div><label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">Ngày bắt đầu</label><DatePicker selected={startDate} onChange={(date: React.SetStateAction<Date | null>) => setStartDate(date)} className="w-full p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm outline-none focus:border-[var(--accent-primary)]" dateFormat="dd/MM/yyyy" /></div>
                    <div><label className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1">Chủ đề</label><select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm outline-none focus:border-[var(--accent-primary)]"><option value="Khám phá">🏔️ Khám phá</option><option value="Nghỉ dưỡng">🏖️ Nghỉ dưỡng</option><option value="Ẩm thực">🍴 Ẩm thực</option><option value="Văn hóa">🏛️ Văn hóa</option></select></div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]"><button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-paper)] transition">Hủy</button><button type="submit" className="px-5 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 transition">Tạo lộ trình</button></div>
                </form>
            </motion.div>
        </div>
    );
}