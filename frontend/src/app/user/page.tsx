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
    Search,
    MapPin,
    Sparkles,
    TrendingUp,
    BookmarkPlus,
    ChevronRight,
    Heart,
    Clock,
    Plus,
    X,
    Send,
    Sun,
    Moon,
    Award,
    CheckCircle2,
    Circle,
    Share2,
    Navigation,
    Luggage,
    Coffee,
    Compass as CompassIcon,
    Users,
    FolderKanban,
    Edit3,
    Clock as ClockIcon,
    PlusCircle,
    Image as ImageIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import confetti from "canvas-confetti";
import { Itinerary, Itinerary_days, Itinerary_locations, Location } from "@/interface";
import { api } from "@/lib/apiClient";
import GlobalStyles from "@/components/user/GlobalStyles";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ============== INTERFACES & TYPES ==============
interface WishlistItem {
    id: string;
    name: string;
    province: string;
    image: string;
    rating: number;
}

interface StarRatingProps {
    rating: number;      // Điểm đánh giá (VD: 4.5, 4.2, 3)
    maxStars?: number;   // Số sao tối đa (Mặc định là 5)
    size?: string;       // Kích thước sao (Tailwind class, VD: "w-5 h-5")
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
const currentUser = {
    name: "Minh Anh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
    level: "Explorer Pro",
    stats: { trips: 14, places: 23, cloned: 89, stamps: 12 },
};

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

function WashiTape({
    color = "var(--washi-teal)",
    className = "",
    style = {},
}: {
    color?: string;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div
            className={`washi-tape z-10 ${className}`}
            style={{
                ...style,
                ["--washi-color" as any]: color,
            }}
        />
    );
}
function StarRating({ rating, maxStars = 5, size = "w-5 h-5" }: StarRatingProps) {
    return (
        <div className="flex items-center gap-1">
            {/* Lặp qua mảng 5 phần tử để render 5 ngôi sao */}
            {[...Array(maxStars)].map((_, index) => {
                // Tính toán phần trăm màu vàng cho từng ngôi sao (từ 0% đến 100%)
                const fillPercentage = Math.max(0, Math.min(100, (rating - index) * 100));

                return (
                    <div key={index} className={`relative ${size}`}>
                        {/* 1. Ngôi sao màu xám (Nền bên dưới) */}
                        <StarIcon className={`${size} text-gray-300 absolute top-0 left-0`} />

                        {/* 2. Ngôi sao màu vàng (Nằm đè lên trên, bị cắt bớt dựa theo % rating) */}
                        <StarIcon
                            className={`${size} text-yellow-400 absolute top-0 left-0`}
                            style={{
                                // Cắt từ bên phải sang (VD: Nếu fill 80%, sẽ cắt bỏ 20% bên phải)
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
const NavItems = [
    { id: "dashboard", label: "Khám phá", icon: Compass },
    { id: "trips", label: "Lộ trình của tôi", icon: FolderKanban },
    { id: "wishlist", label: "Yêu thích", icon: Heart },
    { id: "community", label: "Cộng đồng", icon: Users },
    { id: "ai-planner", label: "AI Planner", icon: Sparkles },
];

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
            <GlobalStyles />
            <Toaster position="bottom-right" />

            {/* ---- HEADER (giữ nguyên) ---- */}
            <header className="sticky top-0 z-40 bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-color)] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-gold)] flex items-center justify-center text-white shadow-md">
                            <CompassIcon className="w-5 h-5" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight hidden sm:inline">Journify</span>
                    </div>

                    <div className="hidden md:flex flex-1 max-w-md relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm điểm đến, lộ trình..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-full text-sm outline-none focus:border-[var(--accent-primary)] transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {NavItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveNav(item.id);
                                    if (item.id === "ai-planner") setIsAiModalOpen(true);
                                    else if (item.id === "community") notify("Tính năng cộng đồng đang phát triển", "🌐");
                                }}
                                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${activeNav === item.id
                                    ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-paper)]"
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}

                        <button
                            onClick={() => setIsCreatingTrip(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent-primary)] text-white text-sm font-bold shadow-md hover:opacity-90 transition"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Tạo lộ trình</span>
                        </button>

                        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[var(--border-color)]">
                            <button
                                onClick={() => setTheme((t) => (t === "day" ? "night" : "day"))}
                                className="p-2 rounded-full hover:bg-[var(--bg-paper)] text-[var(--text-muted)] transition"
                            >
                                {theme === "day" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[var(--accent-gold)]" />}
                            </button>
                            <img
                                src={currentUser.avatar}
                                alt="avatar"
                                className="w-8 h-8 rounded-full border-2 border-[var(--accent-gold)] object-cover cursor-pointer hover:scale-105 transition"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile bottom navigation */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-color)] z-50 flex justify-around items-center py-2 px-2 shadow-lg">
                    {NavItems.slice(0, 4).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveNav(item.id);
                                if (item.id === "ai-planner") setIsAiModalOpen(true);
                            }}
                            className={`flex flex-col items-center gap-0.5 text-xs font-medium ${activeNav === item.id ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => setIsAiModalOpen(true)}
                        className="flex flex-col items-center gap-0.5 text-xs font-medium text-[var(--accent-gold)]"
                    >
                        <Sparkles className="w-5 h-5" />
                        <span>AI</span>
                    </button>
                </div>
            </header>

            {/* ---- MAIN CONTENT ---- */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-20 md:pb-10">
                {/* ========== DASHBOARD PHONG PHÚ ========== */}
                {activeNav === "dashboard" && (
                    <div className="space-y-12 md:space-y-16">
                        {/* Hero Section */}
                        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--accent-primary)]/10 via-[var(--bg-card)] to-[var(--accent-gold)]/10 p-8 md:p-12 shadow-xl border border-[var(--border-color)]">
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--accent-primary)]/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[var(--accent-gold)]/20 rounded-full blur-3xl" />
                            <div className="relative flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-1 space-y-5">
                                    <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
                                        Chào {currentUser.name}, <br />
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-gold)]">
                                            sẵn sàng khám phá
                                        </span>{" "}
                                        chưa?
                                    </h1>
                                    <p className="text-sm md:text-base text-[var(--text-muted)] max-w-lg">
                                        Khám phá Việt Nam theo cách riêng của bạn với những lộ trình cá nhân hóa, gợi ý từ AI và cộng đồng đam mê du lịch.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => setActiveNav("trips")}
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent-primary)] text-white font-bold shadow-lg hover:bg-[var(--accent-primary)]/90 transition"
                                        >
                                            <Compass className="w-5 h-5" /> Khám phá lộ trình
                                        </button>
                                        <button
                                            onClick={() => setIsAiModalOpen(true)}
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] font-bold hover:bg-[var(--bg-paper)] transition"
                                        >
                                            <Sparkles className="w-5 h-5 text-[var(--accent-gold)]" /> Tạo với AI
                                        </button>
                                    </div>
                                </div>
                                <div className="w-full md:w-2/5 h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                                    <img
                                        src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop"
                                        alt="Vietnam travel"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </section>

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

                {/* Trips View (giữ nguyên) */}
                {activeNav === "trips" && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm lộ trình..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-sm outline-none focus:border-[var(--accent-primary)] transition"
                                />
                            </div>
                            <Select
                                placeholder="Vùng miền"
                                options={[
                                    { value: "all", label: "Tất cả" },
                                    { value: "Miền Bắc", label: "Miền Bắc" },
                                    { value: "Miền Trung", label: "Miền Trung" },
                                    { value: "Miền Nam", label: "Miền Nam" },
                                    { value: "Tây Nguyên", label: "Tây Nguyên" },
                                ]}
                                className="w-36"
                                onChange={(opt) => setFilterRegion(opt?.value || "all")}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        background: "var(--bg-paper)",
                                        borderColor: "var(--border-color)",
                                        borderRadius: "12px",
                                        boxShadow: "none",
                                        minHeight: "38px",
                                    }),
                                }}
                            />
                            <Select
                                placeholder="Thời gian"
                                options={[
                                    { value: "all", label: "Tất cả" },
                                    { value: "short", label: "≤ 3 ngày" },
                                    { value: "medium", label: "4-5 ngày" },
                                    { value: "long", label: "> 5 ngày" },
                                ]}
                                className="w-36"
                                onChange={(opt) => setFilterDuration(opt?.value || "all")}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        background: "var(--bg-paper)",
                                        borderColor: "var(--border-color)",
                                        borderRadius: "12px",
                                        boxShadow: "none",
                                        minHeight: "38px",
                                    }),
                                }}
                            />
                            <Select
                                placeholder="Ngân sách"
                                options={[
                                    { value: "all", label: "Tất cả" },
                                    { value: "low", label: "< 2 Tr" },
                                    { value: "medium", label: "2-5 Tr" },
                                    { value: "high", label: "> 5 Tr" },
                                ]}
                                className="w-36"
                                onChange={(opt) => setFilterBudget(opt?.value || "all")}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        background: "var(--bg-paper)",
                                        borderColor: "var(--border-color)",
                                        borderRadius: "12px",
                                        boxShadow: "none",
                                        minHeight: "38px",
                                    }),
                                }}
                            />
                            <div className="flex items-center gap-2 ml-auto">
                                <button onClick={() => setSortBy("date")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${sortBy === "date" ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-paper)] text-[var(--text-muted)]"}`}>Ngày</button>
                                <button onClick={() => setSortBy("budget")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${sortBy === "budget" ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-paper)] text-[var(--text-muted)]"}`}>Ngân sách</button>
                                <button onClick={() => setSortBy("title")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${sortBy === "title" ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-paper)] text-[var(--text-muted)]"}`}>Tên</button>
                            </div>
                        </div>

                        {filteredItineraries.length === 0 ? (
                            <div className="text-center py-16 bg-[var(--bg-card)] border border-dashed border-[var(--border-color)] rounded-3xl">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-paper)] flex items-center justify-center text-[var(--text-muted)]">
                                    <Compass className="w-8 h-8 opacity-40" />
                                </div>
                                <h3 className="font-display font-bold text-lg">Không tìm thấy lộ trình</h3>
                                <p className="text-sm text-[var(--text-muted)] mt-1">Hãy thử điều chỉnh bộ lọc hoặc tạo lộ trình mới.</p>
                                <button onClick={() => { setSearchQuery(""); setFilterRegion("all"); setFilterDuration("all"); setFilterBudget("all"); }} className="mt-4 px-5 py-2.5 rounded-full bg-[var(--accent-primary)] text-white text-sm font-bold">Xóa bộ lọc</button>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={filteredItineraries.map(i => i.id)} strategy={rectSortingStrategy}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredItineraries.map((trip, idx) => (
                                            <SortableTripCard
                                                key={trip.id}
                                                id={trip.id}
                                                trip={trip}
                                                index={idx}
                                                onOpenDetail={() => setActiveTripDetail(trip)}
                                                onClone={() => handleCloneTrip(trip)}
                                                onLike={() => toggleLike(trip.id)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                )}

                {/* Wishlist View (giữ nguyên) */}
                {activeNav === "wishlist" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-2xl font-bold">Wishlist của bạn</h2>
                            <button onClick={() => setIsAiModalOpen(true)} className="text-sm font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Thêm điểm đến</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlist.map((item) => (
                                <WishlistCard key={item.id} item={item} onRemove={() => removeWishlist(item.id)} onExplore={() => notify(`Đang khám phá ${item.name}`, "🗺️")} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Community Placeholder */}
                {activeNav === "community" && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)]">
                            <Users className="w-10 h-10 opacity-40" />
                        </div>
                        <h3 className="font-display text-2xl font-bold">Cộng đồng Journify</h3>
                        <p className="text-[var(--text-muted)] max-w-md mx-auto mt-2">Sắp ra mắt! Kết nối với những người yêu thích du lịch, chia sẻ lộ trình và khám phá thế giới cùng nhau.</p>
                    </div>
                )}
            </main>

            {/* Modals (giữ nguyên) */}
            <AnimatePresence>
                {activeTripDetail && (
                    <TripDetailModal itinerary={activeTripDetail} onClose={() => setActiveTripDetail(null)} onClone={() => handleCloneTrip(activeTripDetail)} />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isAiModalOpen && (
                    <AiPlannerModal onClose={() => setIsAiModalOpen(false)} onSuccess={(newTrip) => { setItineraries([newTrip, ...itineraries]); setIsAiModalOpen(false); triggerConfetti(); notify("AI đã hoàn tất cuốn sổ tay mới của bạn!", "🎉", "success"); }} />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isCreatingTrip && (
                    <CreateTripModal onClose={() => setIsCreatingTrip(false)} onSuccess={(trip) => { setItineraries([trip, ...itineraries]); setIsCreatingTrip(false); notify("Đã tạo lộ trình mới thành công!", "✅", "success"); }} />
                )}
            </AnimatePresence>
        </div>
    );
}

// ============== SUB-COMPONENTS (giữ nguyên thiết kế thân thiện) ==============

function TrendingCard({ trip, rank, onOpen, onClone }: { trip: Itinerary; rank: number; onOpen: () => void; onClone: () => void }) {
    return (
        <div onClick={onOpen} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group">
            <div className="relative h-44 overflow-hidden">
                <img src={trip.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800'} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><TrendingUp className="w-3 h-3 text-[var(--accent-gold)]" /> #{rank}</div>
                <button onClick={(e) => { e.stopPropagation(); onClone(); }} className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 text-[var(--text-main)] hover:bg-[var(--accent-primary)] hover:text-white transition shadow-md" title="Lưu lộ trình"><BookmarkPlus className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
                <h4 className="font-display font-bold text-sm line-clamp-1">{trip.title}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">{trip.itinerary_provinces?.map(p => p.provinces?.name).join(" - ") || "Việt Nam"}</p>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-semibold text-[var(--accent-gold)]">{trip.estimated_cost ? `${trip.estimated_cost.toLocaleString('vi-VN')}đ` : "Tự túc"}</span>
                    <span className="text-xs text-[var(--text-muted)]">{trip.days || 1} ngày</span>
                </div>
            </div>
        </div>
    );
}

function SortableTripCard({ id, trip, index, onOpenDetail, onClone, onLike }: { id: string; trip: Itinerary; index: number; onOpenDetail: () => void; onClone: () => void; onLike: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

    return (
        <motion.div ref={setNodeRef} style={style} {...attributes} {...listeners} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }} onClick={onOpenDetail} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group touch-none relative">
            <div className="relative h-48 overflow-hidden">
                <img src={trip.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800'} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="bg-black/40 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3 text-[var(--accent-gold)]" /> {trip.nights || 0}Đ {trip.days || 1}N</span>
                    <button onClick={(e) => { e.stopPropagation(); onLike(); }} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-rose-500 hover:scale-110 transition-all"><Heart className="w-4 h-4 fill-white/20" /></button>
                </div>
                <div className="absolute bottom-3 left-3 right-3 z-10">
                    <h3 className="font-display font-bold text-white text-lg leading-tight line-clamp-2 drop-shadow-md">{trip.title}</h3>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] mb-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)]" /> {trip.itinerary_provinces?.[0]?.provinces?.name || "Việt Nam"}</span>
                    <span className="text-[var(--accent-gold)] font-bold">{trip.estimated_cost ? `${trip.estimated_cost.toLocaleString('vi-VN')}đ` : "Tự túc"}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {trip.theme?.split(',').map((tag, i) => (
                        <span key={i} className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs px-2.5 py-0.5 rounded-full">#{tag.trim()}</span>
                    ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex justify-end gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onClone(); }} className="p-2 rounded-full bg-[var(--bg-paper)] hover:bg-[var(--accent-primary)] text-[var(--text-main)] hover:text-white transition-colors border border-[var(--border-color)]" title="Lưu vào sổ tay"><BookmarkPlus className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); notify("Đã chia sẻ lộ trình!", "🔗"); }} className="p-2 rounded-full bg-[var(--bg-paper)] hover:bg-[var(--accent-primary)] text-[var(--text-main)] hover:text-white transition-colors border border-[var(--border-color)]" title="Chia sẻ"><Share2 className="w-4 h-4" /></button>
                </div>
            </div>
        </motion.div>
    );
}

function WishlistCard({ item, onRemove, onExplore }: { item: Location; onRemove: () => void; onExplore: () => void }) {
    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
            <div className="relative h-40 overflow-hidden">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-rose-500 transition"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
                <h4 className="font-display font-bold text-base">{item.name}</h4>
                <p className="text-sm text-[var(--text-muted)] flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" /> {item.provinces?.name}</p>
                <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-bold text-[var(--accent-gold)]">★ {item.rating}</span>
                </div>
                <button onClick={onExplore} className="mt-3 w-full py-2 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-bold hover:bg-[var(--accent-primary)] hover:text-white transition">Khám phá</button>
            </div>
        </div>
    );
}

// Trip Detail Modal (giữ nguyên)
function TripDetailModal({ itinerary, onClose, onClone }: { itinerary: Itinerary; onClose: () => void; onClone: () => void }) {
    const [activeTab, setActiveTab] = useState<"itinerary" | "checklist">("itinerary");
    const destination = itinerary.itinerary_provinces?.map(ip => ip.provinces?.name).join(" - ") || "Việt Nam";
    const defaultChecklist = [
        { item: "Căn cước công dân / Hộ chiếu", checked: true },
        { item: "Quần áo phù hợp theo thời tiết", checked: false },
        { item: "Sạc dự phòng & dây cáp", checked: false },
        { item: "Đồ dùng cá nhân", checked: false }
    ];
    const [checklist, setChecklist] = useState(defaultChecklist);
    const toggleCheck = (idx: number) => { setChecklist((prev) => prev.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item)); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[85vh]">
                <div className="md:w-5/12 bg-[var(--bg-bento)] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border-color)] relative">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] font-display bg-[var(--bg-card)] px-3 py-1 rounded-full border border-[var(--border-color)]">{itinerary.days || 1} Ngày Trải Nghiệm</span>
                            <button onClick={onClose} className="md:hidden p-1 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)]"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-md mb-6">
                            <img src={itinerary.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800'} alt={itinerary.title} className="w-full h-full object-cover" />
                            <WashiTape color="var(--washi-coral)" className="top-3 left-3 w-24 -rotate-6" />
                        </div>
                        <h2 className="font-display text-2xl font-bold leading-snug">{itinerary.title}</h2>
                        <p className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-1.5 mt-2"><MapPin className="w-4 h-4 text-[var(--accent-primary)]" /><span>{destination}</span></p>
                        <div className="mt-6 space-y-2.5 pt-6 border-t border-[var(--border-color)] text-xs font-semibold">
                            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Ngân sách dự kiến:</span><span className="text-[var(--accent-gold)] font-bold text-sm">{itinerary.estimated_cost ? itinerary.estimated_cost.toLocaleString('vi-VN') + " đ" : "Tự túc"}</span></div>
                            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Tác giả lộ trình:</span><span>{itinerary.user_id?.name || currentUser.name}</span></div>
                        </div>
                    </div>
                    <div className="mt-8 pt-4 flex gap-3">
                        <button onClick={() => { onClone(); onClose(); }} className="flex-1 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"><BookmarkPlus className="w-4 h-4" /> Clone vào sổ tay</button>
                        <button onClick={() => notify("Đã sao chép liên kết chia sẻ lộ trình!", "🔗")} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors" title="Chia sẻ"><Share2 className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-paper)]">
                    <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
                        <div className="flex gap-2">
                            <button onClick={() => setActiveTab("itinerary")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "itinerary" ? "bg-[var(--text-main)] text-[var(--bg-paper)] shadow-sm" : "bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}><Navigation className="w-3.5 h-3.5" /> Lịch trình</button>
                            <button onClick={() => setActiveTab("checklist")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "checklist" ? "bg-[var(--text-main)] text-[var(--bg-paper)] shadow-sm" : "bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}><Luggage className="w-3.5 h-3.5" /> Hành trang ({checklist.filter((c) => c.checked).length}/{checklist.length})</button>
                        </div>
                        <button onClick={onClose} className="hidden md:flex p-2 rounded-full hover:bg-[var(--bg-paper)] text-[var(--text-muted)] transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                        {activeTab === "itinerary" ? (
                            itinerary.itinerary_days && itinerary.itinerary_days.length > 0 ? (
                                <div className="space-y-8 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--border-color)]">
                                    {itinerary.itinerary_days.map((plan: Itinerary_days) => (
                                        <div key={plan.id} className="relative pl-8">
                                            <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-[var(--accent-gold)] text-white font-display font-bold text-xs flex items-center justify-center shadow-sm z-10">D{plan.day_number}</div>
                                            <h4 className="font-display font-bold text-base">{plan.title || `Ngày ${plan.day_number}`}</h4>
                                            <div className="mt-3 space-y-2.5">
                                                {plan.itinerary_locations.length > 0 ? (
                                                    plan.itinerary_locations.map((loc: Itinerary_locations) => (
                                                        <div key={loc.id} className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-medium leading-relaxed flex items-start gap-2.5 shadow-sm">
                                                            <Coffee className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                                                            <div>
                                                                <span className="font-bold">{loc.start_time.slice(0, 5)} - {loc.location_name}</span>
                                                                {loc.activity_note && <p className="text-[var(--text-muted)] mt-1">{loc.activity_note}</p>}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-[var(--text-muted)]">Chưa thêm hoạt động nào.</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-[var(--text-muted)]"><Compass className="w-10 h-10 mx-auto opacity-30 mb-2 animate-spin-slow" /><p className="text-sm font-medium">Lộ trình chi tiết đang được cập nhật...</p></div>
                            )
                        ) : (
                            <div className="space-y-3">
                                <p className="font-hand text-base text-[var(--text-muted)] mb-4">* Chạm vào từng món đồ để đánh dấu đã chuẩn bị:</p>
                                {checklist.map((item, idx) => (
                                    <div key={idx} onClick={() => toggleCheck(idx)} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-sm font-semibold ${item.checked ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 line-through opacity-80" : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--text-main)]"}`}>
                                        <span>{item.item}</span>
                                        {item.checked ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-[var(--text-muted)] shrink-0" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// AI Planner Modal (giữ nguyên)
function AiPlannerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (trip: Itinerary) => void }) {
    const [prompt, setPrompt] = useState("");
    const [days, setDays] = useState(3);
    const [style, setStyle] = useState("Thư giãn & Healing");
    const [budgetLevel, setBudgetLevel] = useState("Trung bình");
    const [isGenerating, setIsGenerating] = useState(false);
    const [stepText, setStepText] = useState("");

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) { notify("Vui lòng nhập điểm đến hoặc ý tưởng chuyến đi", "⚠️"); return; }
        setIsGenerating(true);
        const steps = ["AI đang phân tích thời tiết & mùa du lịch...", "Đang tổng hợp các quán ăn local ngon-bổ-rẻ...", "Đang vẽ bản đồ di chuyển tối ưu nhất...", "Đang tối ưu ngân sách theo phong cách của bạn...", "Hoàn tất! Đang đóng gói lộ trình..."];
        let stepIdx = 0;
        const interval = setInterval(() => { setStepText(steps[stepIdx % steps.length]); stepIdx++; if (stepIdx === steps.length) clearInterval(interval); }, 800);
        setTimeout(() => {
            clearInterval(interval);
            const newItinerary: Itinerary = {
                id: `ai-${Date.now()}`, title: `Lộ trình ${days} ngày: ${prompt}`, summary: `Lộ trình cá nhân hóa bởi AI Travel Agent (${style})`, start_date: new Date().toISOString(), end_date: new Date(Date.now() + days * 86400000).toISOString(), theme: `${style.split(" ")[0]}, AI Gợi ý`, days: days, nights: days - 1, estimated_cost: days * 1500000 + (budgetLevel === "Cao" ? 2000000 : budgetLevel === "Thấp" ? -1000000 : 0), image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop", share: false, user_id: { name: "AI Agent 🤖", avatar: "🤖", id: "", email: "", role: "USER", status: "active", created_at: "", itineraries: [], phone_number: 0 }, itinerary_provinces: [{ provinces: { name: prompt.split(" ")[0] || "Việt Nam", id: "" } }], itinerary_days: [{ id: `day1-${Date.now()}`, day_number: 1, title: "Khám phá bản sắc địa phương", itinerary_locations: [{ id: "loc1", day_id: "", location_id: "", sequence_order: 1, cost: 0, lat: 0, lng: 0, start_time: "08:00", end_time: "09:00", location_name: "Ăn sáng đặc sản địa phương", activity_note: "Trải nghiệm ẩm thực không thể bỏ qua" }] }]
            };
            onSuccess(newItinerary);
        }, 4000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isGenerating && onClose()} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] p-6 sm:p-8 shadow-2xl z-10 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-gold)] rounded-full blur-3xl opacity-20 pointer-events-none" />
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-gold)] flex items-center justify-center text-white shadow-md"><Sparkles className="w-5 h-5 animate-spin-slow" /></div>
                        <div><h3 className="font-display font-bold text-lg">AI Travel Designer</h3><p className="text-xs text-[var(--text-muted)] font-medium">Soạn thảo lộ trình cá nhân hóa trong vài giây</p></div>
                    </div>
                    <button onClick={onClose} disabled={isGenerating} className="p-2 rounded-full hover:bg-[var(--bg-paper)] text-[var(--text-muted)] transition-colors disabled:opacity-50"><X className="w-5 h-5" /></button>
                </div>
                {isGenerating ? (
                    <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-16 h-16"><div className="absolute inset-0 rounded-full border-4 border-[var(--accent-primary)]/20 animate-ping" /><div className="w-full h-full rounded-full border-4 border-t-[var(--accent-primary)] border-r-[var(--accent-gold)] border-b-transparent border-l-transparent animate-spin" /><CompassIcon className="w-6 h-6 text-[var(--accent-primary)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /></div>
                        <h4 className="font-display font-bold text-base animate-pulse text-[var(--text-main)]">{stepText}</h4>
                    </div>
                ) : (
                    <form onSubmit={handleGenerate} className="space-y-5">
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Bạn muốn đi đâu hoặc trải nghiệm gì? *</label><textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="VD: Phú Yên 3 ngày cùng nhóm bạn 4 người..." className="w-full p-4 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm font-medium outline-none focus:border-[var(--accent-primary)] transition-colors resize-none leading-relaxed" required /></div>
                        <div className="flex flex-wrap gap-1.5 pt-1">{["Nghỉ dưỡng Đà Lạt", "Food Tour Hải Phòng", "Phượt xe máy Hà Giang", "Biển Phú Quý"].map((hint) => (<button key={hint} type="button" onClick={() => setPrompt(hint)} className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all">+ {hint}</button>))}</div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div><label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Thời gian</label><select value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full p-3.5 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm font-bold outline-none focus:border-[var(--accent-primary)] transition-colors"><option value={2}>2 Ngày 1 Đêm</option><option value={3}>3 Ngày 2 Đêm</option><option value={4}>4 Ngày 3 Đêm</option><option value={5}>5 Ngày 4 Đêm</option></select></div>
                            <div><label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Phong cách</label><select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full p-3.5 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm font-bold outline-none focus:border-[var(--accent-primary)] transition-colors"><option value="Thư giãn & Healing">🌿 Chữa lành & Chill</option><option value="Ẩm thực & Food Tour">🍜 Ăn sập địa phương</option><option value="Nhiếp ảnh & Check-in">📸 Sống ảo & Cafe</option><option value="Trekking & Khám phá">⛰️ Mạo hiểm & Trekking</option></select></div>
                        </div>
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Mức ngân sách</label><select value={budgetLevel} onChange={(e) => setBudgetLevel(e.target.value)} className="w-full p-3.5 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm font-bold outline-none focus:border-[var(--accent-primary)] transition-colors"><option value="Thấp">💰 Tiết kiệm</option><option value="Trung bình">💰💰 Trung bình</option><option value="Cao">💰💰💰 Cao cấp</option></select></div>
                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border-color)]"><button type="button" onClick={onClose} className="px-5 py-3 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-paper)] transition-colors">Hủy bỏ</button><button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-gold)] text-white text-xs font-bold shadow-lg shadow-[var(--accent-primary)]/25 hover:opacity-95 transition-all flex items-center gap-2"><Send className="w-3.5 h-3.5" /><span>Bắt đầu tạo lộ trình</span></button></div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}

// Create Trip Modal (giữ nguyên)
function CreateTripModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (trip: Itinerary) => void }) {
    const [title, setTitle] = useState("");
    const [destination, setDestination] = useState("");
    const [days, setDays] = useState(3);
    const [budget, setBudget] = useState(3000000);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [theme, setTheme] = useState("Khám phá");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !destination.trim()) { notify("Vui lòng điền đầy đủ thông tin", "⚠️"); return; }
        const newTrip: Itinerary = { id: `manual-${Date.now()}`, title, summary: `Lộ trình ${days} ngày tại ${destination}`, start_date: startDate?.toISOString() || new Date().toISOString(), end_date: startDate ? new Date(startDate.getTime() + days * 86400000).toISOString() : new Date(Date.now() + days * 86400000).toISOString(), theme: theme, days: days, nights: days - 1, estimated_cost: budget, image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop", share: false, user_id: { name: currentUser.name, avatar: currentUser.avatar, id: "", email: "", role: "USER", status: "active", created_at: "", itineraries: [], phone_number: 0 }, itinerary_provinces: [{ provinces: { name: destination, id: "" } }], itinerary_days: [] };
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