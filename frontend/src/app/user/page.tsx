/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Compass,
    Search,
    MapPin,
    Calendar,
    Sparkles,
    TrendingUp,
    Copy,
    BookmarkPlus,
    ChevronRight,
    Heart,
    Clock,
    Plus,
    Filter,
    X,
    Send,
    Sun,
    Moon,
    Award,
    Pin,
    CheckCircle2,
    Circle,
    Share2,
    Navigation,
    CloudSun,
    Luggage,
    Coffee,
    Camera,
    Compass as CompassIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { RoughNotation } from "react-rough-notation";
import confetti from "canvas-confetti";

/* ============================================================
   0. DESIGN SYSTEM & STYLES (Modern Bento Scrapbook)
   ============================================================ */
function GlobalStyles() {
    return (
        <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Space+Grotesk:wght@500;700&display=swap");

      :root {
        --bg-paper: #fcfaf6;
        --bg-card: #ffffff;
        --bg-bento: #f5f2eb;
        --text-main: #1e293b;
        --text-muted: #64748b;
        --border-color: #e2e8f0;
        --accent-primary: #ff5a36;
        --accent-secondary: #0ea5e9;
        --accent-tertiary: #10b981;
        --accent-gold: #f59e0b;
        --washi-teal: rgba(45, 212, 191, 0.75);
        --washi-coral: rgba(255, 113, 91, 0.75);
        --washi-yellow: rgba(251, 191, 36, 0.75);
        --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        --shadow-float: 0 20px 25px -5px rgba(0, 0, 0, 0.08),
          0 8px 10px -6px rgba(0, 0, 0, 0.04);
      }

      .theme-night {
        --bg-paper: #0f172a;
        --bg-card: #1e293b;
        --bg-bento: #162032;
        --text-main: #f8fafc;
        --text-muted: #94a3b8;
        --border-color: #334155;
        --accent-primary: #ff6b4a;
        --accent-secondary: #38bdf8;
        --washi-teal: rgba(20, 184, 166, 0.65);
        --washi-coral: rgba(244, 63, 94, 0.65);
        --washi-yellow: rgba(245, 158, 11, 0.65);
        --shadow-float: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      }

      body {
        background-color: var(--bg-paper);
        color: var(--text-main);
        font-family: "Plus Jakarta Sans", sans-serif;
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      /* Dot Grid Paper Texture */
      .paper-grid {
        background-image: radial-gradient(
          var(--border-color) 1px,
          transparent 1px
        );
        background-size: 24px 24px;
      }

      .font-hand {
        font-family: "Caveat", cursive;
      }
      .font-display {
        font-family: "Space Grotesk", sans-serif;
      }

      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: var(--text-muted);
        border-radius: 99px;
        opacity: 0.5;
      }

      /* Washi Tape Effect */
      .washi-tape {
        position: absolute;
        height: 22px;
        background-color: var(--washi-color, var(--washi-teal));
        opacity: 0.85;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(2px);
      }
      .washi-tape::after {
        content: "";
        position: absolute;
        left: -6px;
        right: -6px;
        top: 0;
        bottom: 0;
        background: inherit;
        clip-path: polygon(
          0% 0%,
          5% 10%,
          0% 20%,
          5% 30%,
          0% 40%,
          5% 50%,
          0% 60%,
          5% 70%,
          0% 80%,
          5% 90%,
          0% 100%,
          100% 100%,
          95% 90%,
          100% 80%,
          95% 70%,
          100% 60%,
          95% 50%,
          100% 40%,
          95% 30%,
          100% 20%,
          95% 10%,
          100% 0%
        );
      }
    `}</style>
    );
}

/* ============================================================
   1. TYPE DEFINITIONS & MOCK DATA
   ============================================================ */
interface DailyPlan {
    day: number;
    title: string;
    activities: string[];
}

interface Trip {
    id: string;
    title: string;
    destination: string;
    days: number;
    coverImage: string;
    startDate: string;
    endDate: string;
    tags: string[];
    isPublic: boolean;
    author: { name: string; avatar: string; verified?: boolean };
    clonedCount: number;
    likesCount: number;
    progress?: number;
    budget?: string;
    itinerary?: DailyPlan[];
    checklist?: { item: string; checked: boolean }[];
}

interface WishlistItem {
    id: string;
    name: string;
    location: string;
    image: string;
    rating: number;
    type: "beach" | "mountain" | "city" | "cultural";
    priceEst: string;
}

const currentUser = {
    name: "Minh Anh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
    level: "Explorer Pro",
    stats: { trips: 14, places: 23, cloned: 89, stamps: 12 },
};

const INITIAL_TRIPS: Trip[] = [
    {
        id: "t1",
        title: "Đà Lạt mùa săn mây & Cafe ẩn mình trong rừng thông",
        destination: "Đà Lạt, Lâm Đồng",
        days: 3,
        coverImage:
            "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000&auto=format&fit=crop",
        startDate: "2026-08-10",
        endDate: "2026-08-12",
        tags: ["Săn mây", "Cafe", "Chữa lành"],
        isPublic: true,
        author: { name: "Minh Anh", avatar: currentUser.avatar, verified: true },
        clonedCount: 1420,
        likesCount: 350,
        progress: 80,
        budget: "3.500.000đ / người",
        itinerary: [
            {
                day: 1,
                title: "Chạm ngõ Phố Núi & Hoàng hôn xóm Lèo",
                activities: [
                    "06:00 - Đáp chuyến bay sớm, check-in Homestay Gỗ",
                    "08:30 - Thưởng thức bánh căn Lệ & cafe phượt",
                    "15:00 - Săn hoàng hôn và uống trà ấm tại Tiệm cafe Túi Mơ To",
                ],
            },
            {
                day: 2,
                title: "Săn mây đồi Đa Phú & Rừng thông",
                activities: [
                    "04:30 - Dậy sớm di chuyển lên đồi Đa Phú săn biển mây",
                    "09:00 - Chụp ảnh rừng thông ngoại ô & thăm vườn hồng",
                    "18:00 - Lẩu bò Ba Toa & đi dạo chợ đêm Đà Lạt",
                ],
            },
            {
                day: 3,
                title: "Mua quà lưu niệm & Tạm biệt",
                activities: [
                    "08:00 - Cafe sáng bên Hồ Tuyền Lâm yên tĩnh",
                    "10:30 - Mua dâu tây và hồng treo gió tại vườn",
                    "14:00 - Di chuyển ra sân bay Liên Khương",
                ],
            },
        ],
        checklist: [
            { item: "Áo khoác len & khăn choàng ấm", checked: true },
            { item: "Máy ảnh & pin dự phòng", checked: true },
            { item: "Kem dưỡng ẩm (tránh khô da)", checked: false },
            { item: "CCCD & Vé máy bay offline", checked: true },
        ],
    },
    {
        id: "t2",
        title: "Cung đường biển Vĩnh Hy - Hang Rái ngập nắng",
        destination: "Ninh Thuận - Khánh Hòa",
        days: 4,
        coverImage:
            "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop",
        startDate: "2026-09-25",
        endDate: "2026-09-28",
        tags: ["Biển đảo", "Phượt xe máy", "Nhiếp ảnh"],
        isPublic: true,
        author: {
            name: "Tuấn Trần",
            avatar:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
        },
        clonedCount: 890,
        likesCount: 210,
        progress: 35,
        budget: "4.200.000đ / người",
    },
    {
        id: "t3",
        title: "Mùa vàng Mù Cang Chải - Bay trên mùa nước đổ",
        destination: "Yên Bái - Tây Bắc",
        days: 3,
        coverImage:
            "https://images.unsplash.com/photo-1505995433366-e12047f3f144?q=80&w=1000&auto=format&fit=crop",
        startDate: "2026-10-15",
        endDate: "2026-10-18",
        tags: ["Trekking", "Nhiếp ảnh", "Văn hóa"],
        isPublic: false,
        author: { name: "Minh Anh", avatar: currentUser.avatar },
        clonedCount: 0,
        likesCount: 45,
        progress: 10,
        budget: "2.800.000đ / người",
    },
];

const TRENDING_TRIPS: Trip[] = [
    {
        id: "tr1",
        title: "Bí kíp vi vu Phú Quốc 4N3Đ ngắm hoàng hôn rực rỡ nhất",
        destination: "Phú Quốc, Kiên Giang",
        days: 4,
        coverImage:
            "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop",
        startDate: "",
        endDate: "",
        tags: ["Biển đảo", "Resort", "Hoàng hôn"],
        isPublic: true,
        author: {
            name: "Hoàng Lam",
            avatar:
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop",
            verified: true,
        },
        clonedCount: 3240,
        likesCount: 890,
        budget: "6.500.000đ / người",
    },
    {
        id: "tr2",
        title: "Food Tour Hà Nội 48h - Ăn sập phố cổ không lo cháy túi",
        destination: "Hà Nội",
        days: 2,
        coverImage:
            "https://images.unsplash.com/photo-1509030450996-93f24f7f77b8?q=80&w=800&auto=format&fit=crop",
        startDate: "",
        endDate: "",
        tags: ["Ẩm thực", "Văn hóa", "Sống chậm"],
        isPublic: true,
        author: {
            name: "Thảo Vy",
            avatar:
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&auto=format&fit=crop",
        },
        clonedCount: 2310,
        likesCount: 680,
        budget: "1.500.000đ / người",
    },
    {
        id: "tr3",
        title: "Chinh phục đèo Mã Pì Lèng & Sông Nho Quế xanh ngắt",
        destination: "Hà Giang",
        days: 4,
        coverImage:
            "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop",
        startDate: "",
        endDate: "",
        tags: ["Trekking", "Khám phá", "Thử thách"],
        isPublic: true,
        author: {
            name: "Quang Huy",
            avatar:
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop",
            verified: true,
        },
        clonedCount: 1980,
        likesCount: 540,
        budget: "4.800.000đ / người",
    },
];

const WISHLIST_ITEMS: WishlistItem[] = [
    {
        id: "w1",
        name: "Thị trấn Sapa mờ sương & Bản Cát Cát",
        location: "Lào Cai",
        rating: 4.8,
        image:
            "https://images.unsplash.com/photo-1505995433366-e12047f3f144?q=80&w=600&auto=format&fit=crop",
        type: "mountain",
        priceEst: "~3.2 Tr",
    },
    {
        id: "w2",
        name: "Phố cổ Hội An rực rỡ đêm đèn lồng",
        location: "Quảng Nam",
        rating: 4.9,
        image:
            "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=600&auto=format&fit=crop",
        type: "cultural",
        priceEst: "~4.0 Tr",
    },
    {
        id: "w3",
        name: "Vịnh Ninh Vân - Ốc đảo bình yên",
        location: "Khánh Hòa",
        rating: 4.9,
        image:
            "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=600&auto=format&fit=crop",
        type: "beach",
        priceEst: "~8.5 Tr",
    },
];

/* ============================================================
   2. HELPER UTILS & COMPONENTS
   ============================================================ */
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

/* Washi Tape UI Component */
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
export default function JournifyDashboard() {
    const [theme, setTheme] = useState<"day" | "night">("day");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string>("Tất cả");
    const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
    const [wishlist, setWishlist] = useState<WishlistItem[]>(WISHLIST_ITEMS);

    // Modals
    const [activeTripDetail, setActiveTripDetail] = useState<Trip | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    // Sync theme class with body
    useEffect(() => {
        if (theme === "night") {
            document.documentElement.classList.add("theme-night");
        } else {
            document.documentElement.classList.remove("theme-night");
        }
    }, [theme]);

    // Filter logic
    const filteredTrips = useMemo(() => {
        return trips.filter((trip) => {
            const matchesSearch =
                trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTag =
                selectedTag === "Tất cả" || trip.tags.includes(selectedTag);
            return matchesSearch && matchesTag;
        });
    }, [trips, searchQuery, selectedTag]);

    // Actions
    const handleCloneTrip = (trip: Trip) => {
        triggerConfetti();
        const cloned: Trip = {
            ...trip,
            id: `cloned-${Date.now()}`,
            title: `${trip.title} (Bản sao)`,
            author: { name: currentUser.name, avatar: currentUser.avatar },
            clonedCount: 0,
            likesCount: 1,
            progress: 0,
            isPublic: false,
        };
        setTrips([cloned, ...trips]);
        notify(`Đã lưu "${trip.title}" vào sổ tay của bạn!`, "📌");
    };

    const toggleLike = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setTrips((prev) =>
            prev.map((t) =>
                t.id === id ? { ...t, likesCount: t.likesCount + 1 } : t
            )
        );
        notify("Đã thêm vào danh sách yêu thích!", "❤️");
    };

    const removeWishlist = (id: string) => {
        setWishlist((prev) => prev.filter((item) => item.id !== id));
        notify("Đã xóa khỏi Wishlist", "🗑️");
    };

    return (
        <div className="min-h-screen paper-grid pb-20 selection:bg-[var(--accent-primary)] selection:text-white">
            <GlobalStyles />
            <Toaster position="bottom-right" />

            {/* ========== FLOATING NAVBAR ========== */}
            <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--bg-paper)]/80 border-b border-[var(--border-color)] transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo & Brand */}
                    <div
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedTag("Tất cả");
                        }}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-gold)] flex items-center justify-center text-white shadow-md group-hover:rotate-6 transition-transform">
                            <CompassIcon className="w-5 h-5 animate-spin-slow" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 font-display font-bold text-lg tracking-tight leading-none">
                                <span>Journify</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-sans font-semibold">
                                    v2.0
                                </span>
                            </div>
                            <p className="font-hand text-xs text-[var(--text-muted)] mt-0.5">
                                sổ tay du lịch thế hệ mới
                            </p>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-[var(--text-muted)]">
                        <a
                            href="#upcoming"
                            className="hover:text-[var(--text-main)] transition-colors"
                        >
                            Lộ trình của tôi
                        </a>
                        <a
                            href="#wishlist"
                            className="hover:text-[var(--text-main)] transition-colors"
                        >
                            Wishlist
                        </a>
                        <a
                            href="#trending"
                            className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5 text-[var(--accent-primary)] font-semibold"
                        >
                            <TrendingUp className="w-4 h-4" /> Khám phá xu hướng
                        </a>
                    </nav>

                    {/* User Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setTheme((t) => (t === "day" ? "night" : "day"))}
                            className="p-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            aria-label="Đổi giao diện"
                        >
                            {theme === "day" ? (
                                <Moon className="w-4 h-4" />
                            ) : (
                                <Sun className="w-4 h-4 text-[var(--accent-gold)]" />
                            )}
                        </button>

                        <div
                            onClick={() => notify("Trang trang cá nhân đang phát triển", "🛠️")}
                            className="flex items-center gap-2.5 pl-2 cursor-pointer p-1.5 rounded-full hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-color)] transition-all"
                        >
                            <img
                                src={currentUser.avatar}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full object-cover border-2 border-[var(--accent-gold)]"
                            />
                            <div className="hidden sm:block text-left leading-tight">
                                <p className="text-xs font-bold">{currentUser.name}</p>
                                <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 font-medium">
                                    <Award className="w-3 h-3 text-[var(--accent-gold)]" />
                                    {currentUser.level}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== HERO: THE BENTO JOURNAL ========== */}
            <section className="pt-8 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Bento Box 1: Welcome & Search (Span 7) */}
                    <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm">
                        {/* Background Decorative Element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-bento)] border border-[var(--border-color)] text-xs font-medium text-[var(--text-muted)] mb-4">
                                <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                                <span>
                                    Tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}{" "}
                                    — Nhật ký hành trình
                                </span>
                            </div>

                            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
                                Chào bạn hữu,{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-gold)]">
                                    {currentUser.name}
                                </span>
                                ! ✈️
                            </h1>
                            <p className="mt-3 text-[var(--text-muted)] text-sm sm:text-base leading-relaxed max-w-xl">
                                Bạn đang có{" "}
                                <RoughNotation
                                    type="highlight"
                                    show
                                    color="rgba(255, 90, 54, 0.15)"
                                    padding={[2, 6]}
                                >
                                    <strong className="text-[var(--text-main)] font-semibold">
                                        2 chuyến đi
                                    </strong>
                                </RoughNotation>{" "}
                                sắp khởi hành. Đã đến lúc kiểm tra lại checklist hành lý và sẵn
                                sàng cho những trải nghiệm mới!
                            </p>
                        </div>

                        {/* Interactive Search Bar & AI CTA */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--border-color)]">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm địa điểm, lộ trình..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-10 py-3.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl text-sm font-medium outline-none focus:border-[var(--accent-primary)] transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => setIsAiModalOpen(true)}
                                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-[#ff7e5f] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-primary)]/25 hover:shadow-xl hover:shadow-[var(--accent-primary)]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0"
                            >
                                <Sparkles className="w-4 h-4 animate-bounce" />
                                <span>AI Thiết kế Lộ trình</span>
                            </button>
                        </div>
                    </div>

                    {/* Bento Box 2: Next Trip Countdown (Span 5) */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-md group">
                        {/* Background image with overlay */}
                        <img
                            src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop"
                            alt="Đà Lạt"
                            className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent pointer-events-none" />

                        {/* Content */}
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <span className="text-xs font-bold tracking-wider uppercase bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[var(--accent-gold)] border border-white/10">
                                    Chuyến đi tiếp theo
                                </span>
                                <h3 className="font-display text-xl font-bold mt-3 leading-snug">
                                    Đà Lạt - Săn mây xóm Lèo
                                </h3>
                                <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                                    Lâm Đồng • 10/08 - 12/08/2026
                                </p>
                            </div>

                            {/* Weather Widget */}
                            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 flex flex-col items-center shrink-0">
                                <CloudSun className="w-6 h-6 text-[var(--accent-gold)]" />
                                <span className="text-xs font-bold mt-1">18°C</span>
                            </div>
                        </div>

                        <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-end justify-between">
                            <div>
                                <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">
                                    Thời gian đếm ngược:
                                </span>
                                <div className="flex items-baseline gap-1.5 font-display">
                                    <span className="text-3xl font-extrabold text-[var(--accent-gold)]">
                                        13
                                    </span>
                                    <span className="text-sm font-medium text-slate-300">
                                        ngày nữa
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setActiveTripDetail(INITIAL_TRIPS[0])}
                                className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                                Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Tags Bar */}
                <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
                    <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5 mr-2 shrink-0 uppercase tracking-wider">
                        <Filter className="w-3.5 h-3.5" /> Lọc chủ đề:
                    </span>
                    {[
                        "Tất cả",
                        "Săn mây",
                        "Biển đảo",
                        "Cafe",
                        "Nhiếp ảnh",
                        "Chữa lành",
                        "Trekking",
                    ].map((tag) => {
                        const active = selectedTag === tag;
                        return (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${active
                                    ? "bg-[var(--text-main)] text-[var(--bg-paper)] shadow-md translate-y-[-1px]"
                                    : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--text-main)]"
                                    }`}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ========== SECTION 1: MY TRIPS (POLAROID SPREAD) ========== */}
            <section id="upcoming" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] animate-ping" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] font-display">
                                Sổ tay cá nhân
                            </span>
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-1 flex items-center gap-3">
                            <span>Lộ trình đang lên kế hoạch</span>
                            <span className="text-sm px-2.5 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] font-sans font-medium">
                                {filteredTrips.length}
                            </span>
                        </h2>
                    </div>

                    <button
                        onClick={() => setIsAiModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-bento)] text-xs font-bold transition-all self-start sm:self-auto shadow-sm"
                    >
                        <Plus className="w-4 h-4 text-[var(--accent-primary)]" />
                        <span>Thêm chuyến đi mới</span>
                    </button>
                </div>

                {filteredTrips.length === 0 ? (
                    <div className="p-12 text-center bg-[var(--bg-card)] border border-dashed border-[var(--border-color)] rounded-[24px]">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-bento)] flex items-center justify-center text-[var(--text-muted)]">
                            <Compass className="w-8 h-8 opacity-40 animate-pulse" />
                        </div>
                        <h3 className="font-display font-bold text-lg">
                            Không tìm thấy trang nhật ký nào
                        </h3>
                        <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto mt-1">
                            Thử tìm kiếm với từ khóa khác hoặc chọn lại chủ đề hiển thị nhé.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedTag("Tất cả");
                            }}
                            className="mt-5 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold shadow-md"
                        >
                            Xem tất cả lộ trình
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                        <AnimatePresence>
                            {filteredTrips.map((trip, idx) => (
                                <PolaroidCard
                                    key={trip.id}
                                    trip={trip}
                                    index={idx}
                                    onOpenDetail={() => setActiveTripDetail(trip)}
                                    onClone={() => handleCloneTrip(trip)}
                                    onLike={(e) => toggleLike(trip.id, e)}
                                    showProgress
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </section>

            {/* ========== SECTION 2: WISHLIST & AI SUGGESTIONS ========== */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Scrapbook Wishlist (Span 4) */}
                    <div
                        id="wishlist"
                        className="lg:col-span-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] p-6 relative shadow-sm"
                    >
                        <Pin
                            className="absolute -top-3 left-8 w-6 h-6 text-[var(--accent-primary)] -rotate-12 drop-shadow"
                            fill="currentColor"
                        />

                        <div className="flex items-center justify-between mb-6 pt-1">
                            <div>
                                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                                    <Heart
                                        className="w-4 h-4 text-[var(--accent-primary)]"
                                        fill="currentColor"
                                    />
                                    <span>Góc Wishlist</span>
                                </h3>
                                <p className="font-hand text-sm text-[var(--text-muted)]">
                                    những điểm đến đang ấp ủ
                                </p>
                            </div>
                            <span className="text-xs font-bold text-[var(--text-muted)]">
                                {wishlist.length} địa điểm
                            </span>
                        </div>

                        {/* List */}
                        <div className="space-y-3.5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-dashed before:border-l-2 before:border-dashed before:border-[var(--border-color)]">
                            <AnimatePresence>
                                {wishlist.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() =>
                                            notify(`Đang xem dữ liệu của ${item.name}`, "🗺️")
                                        }
                                        className="relative pl-7 group cursor-pointer"
                                    >
                                        {/* Timeline dot */}
                                        <span className="absolute left-2 top-4 w-3.5 h-3.5 rounded-full bg-[var(--bg-card)] border-2 border-[var(--accent-gold)] group-hover:bg-[var(--accent-gold)] transition-colors z-10" />

                                        <div className="p-3 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-gold)] transition-all flex items-center gap-3">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-14 h-14 rounded-xl object-cover shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-xs truncate group-hover:text-[var(--accent-primary)] transition-colors">
                                                    {item.name}
                                                </h4>
                                                <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{item.location}</span>
                                                </p>
                                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-[var(--border-color)]/50">
                                                    <span className="text-[10px] font-bold text-[var(--accent-gold)]">
                                                        ★ {item.rating}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                                                        {item.priceEst}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeWishlist(item.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-[var(--text-muted)] transition-all"
                                                title="Xóa"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={() => setIsAiModalOpen(true)}
                            className="w-full mt-6 py-3 rounded-2xl border border-dashed border-[var(--border-color)] hover:border-[var(--accent-primary)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Thêm điểm đến vào Wishlist
                        </button>
                    </div>

                    {/* Right Column: AI Match Suggestions (Span 8) */}
                    <div className="lg:col-span-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                            <div>
                                <div className="inline-flex items-center gap-1.5 font-hand text-base text-[var(--accent-primary)] font-bold">
                                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                                    Gợi ý riêng từ AI Travel Agent
                                </div>
                                <h3 className="font-display text-xl font-bold">
                                    Lộ trình hoàn hảo cho tuần tới
                                </h3>
                            </div>
                            <button
                                onClick={() =>
                                    notify("Đang phân tích lại lịch sử tìm kiếm...", "🔄")
                                }
                                className="text-xs font-bold text-[var(--accent-secondary)] hover:underline flex items-center gap-1 self-start sm:self-auto"
                            >
                                Cập nhật sở thích <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                {
                                    id: "s1",
                                    title: "Food Tour & Retreat 3 Ngày Tại Đà Nẵng",
                                    dest: "Đà Nẵng - Hội An",
                                    days: 3,
                                    budget: "4.500.000 đ",
                                    desc: "Khám phá bán đảo Sơn Trà, thưởng thức hải sản địa phương và ngắm đèn lồng phố cổ Hội An về đêm.",
                                    image:
                                        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop",
                                    reason: "Trùng khớp 98% sở thích Ẩm thực & Biển",
                                    tag: "Sáng giá nhất",
                                },
                                {
                                    id: "s2",
                                    title: "Hành Trình Chinh Phục Cực Bắc Hà Giang",
                                    dest: "Hà Giang - Đồng Văn",
                                    days: 4,
                                    budget: "6.200.000 đ",
                                    desc: "Chinh phục đèo Mã Pì Lèng huyền thoại, đi thuyền trên sông Nho Quế và tìm hiểu văn hóa bản địa độc đáo.",
                                    image:
                                        "https://images.unsplash.com/photo-1509030450996-93f24f7f77b8?q=80&w=800&auto=format&fit=crop",
                                    reason: "Dựa trên chuyến đi Mù Cang Chải của bạn",
                                    tag: "Thử thách",
                                },
                            ].map((sug, i) => (
                                <div
                                    key={sug.id}
                                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group relative"
                                >
                                    <WashiTape
                                        color={
                                            i === 0 ? "var(--washi-yellow)" : "var(--washi-teal)"
                                        }
                                        className="top-3 -right-6 w-28 rotate-45 text-[10px] font-bold text-center py-0.5 leading-tight !h-6 flex items-center justify-center text-slate-900 shadow-sm"
                                    />

                                    <div>
                                        <div className="relative h-44 overflow-hidden">
                                            <img
                                                src={sug.image}
                                                alt={sug.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                                                <span className="text-xs font-bold flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)]" />{" "}
                                                    {sug.dest}
                                                </span>
                                                <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                                                    {sug.days} ngày
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2.5 py-1 rounded-full mb-2.5">
                                                <Sparkles className="w-3 h-3" />
                                                <span>{sug.reason}</span>
                                            </div>
                                            <h4 className="font-display font-bold text-base leading-snug group-hover:text-[var(--accent-primary)] transition-colors">
                                                {sug.title}
                                            </h4>
                                            <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed line-clamp-2">
                                                {sug.desc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-5 py-3.5 bg-[var(--bg-paper)] border-t border-[var(--border-color)] flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-[var(--text-muted)] block">
                                                Chi phí dự kiến:
                                            </span>
                                            <span className="text-xs font-bold text-[var(--text-main)]">
                                                {sug.budget}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                handleCloneTrip({
                                                    id: sug.id,
                                                    title: sug.title,
                                                    destination: sug.dest,
                                                    days: sug.days,
                                                    coverImage: sug.image,
                                                    startDate: "2026-11-01",
                                                    endDate: "2026-11-04",
                                                    tags: ["AI Gợi ý", "Khám phá"],
                                                    isPublic: false,
                                                    author: { name: "AI Agent", avatar: "🤖" },
                                                    clonedCount: 0,
                                                    likesCount: 1,
                                                });
                                            }}
                                            className="px-4 py-2 rounded-xl bg-[var(--text-main)] text-[var(--bg-paper)] text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
                                        >
                                            <Copy className="w-3.5 h-3.5" /> Thêm vào sổ tay
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== SECTION 3: COMMUNITY TRENDING ========== */}
            <section
                id="trending"
                className="py-14 bg-[var(--bg-bento)] border-y border-[var(--border-color)]"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            <div className="flex items-center gap-2 font-hand text-lg text-[var(--accent-primary)] font-bold">
                                <TrendingUp className="w-5 h-5" />
                                <span>Xu hướng cộng đồng Journify</span>
                            </div>
                            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                                Lộ Trình Được Clone Nhiều Nhất Tuần
                            </h2>
                        </div>
                        <a
                            href="#explore-more"
                            onClick={() => notify("Đang tải dữ liệu cộng đồng...", "🌐")}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--text-main)] hover:text-[var(--accent-primary)] transition-colors"
                        >
                            <span>Khám phá trạm bưu điện cộng đồng</span>
                            <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {TRENDING_TRIPS.map((trip, idx) => (
                            <PolaroidCard
                                key={trip.id}
                                trip={trip}
                                index={idx}
                                rank={idx + 1}
                                isTrending
                                onOpenDetail={() => setActiveTripDetail(trip)}
                                onClone={() => handleCloneTrip(trip)}
                                onLike={(e) => toggleLike(trip.id, e)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className="py-10 text-center text-sm text-[var(--text-muted)] max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-center gap-2 font-display font-bold text-lg text-[var(--text-main)] mb-2">
                    <CompassIcon className="w-5 h-5 text-[var(--accent-primary)]" />
                    <span>Journify Journal</span>
                </div>
                <p className="font-hand text-base">
                    &quot;Được thiết kế với lòng say mê dịch chuyển & những trang giấy nháp.&quot;
                </p>
                <div className="mt-6 pt-6 border-t border-[var(--border-color)] flex flex-wrap justify-center gap-6 text-xs font-semibold">
                    <a
                        href="#terms"
                        className="hover:text-[var(--text-main)] transition-colors"
                    >
                        Điều khoản sử dụng
                    </a>
                    <a
                        href="#privacy"
                        className="hover:text-[var(--text-main)] transition-colors"
                    >
                        Quyền riêng tư
                    </a>
                    <a
                        href="#api"
                        className="hover:text-[var(--text-main)] transition-colors"
                    >
                        API dành cho Nhà phát triển
                    </a>
                    <span>© 2026 Journify Vietnam.</span>
                </div>
            </footer>

            {/* ========== MODAL 1: TRIP SPREAD DETAIL (SỔ TAY CHI TIẾT) ========== */}
            <AnimatePresence>
                {activeTripDetail && (
                    <TripDetailModal
                        trip={activeTripDetail}
                        onClose={() => setActiveTripDetail(null)}
                        onClone={() => handleCloneTrip(activeTripDetail)}
                    />
                )}
            </AnimatePresence>

            {/* ========== MODAL 2: AI TRAVEL PLANNER ========== */}
            <AnimatePresence>
                {isAiModalOpen && (
                    <AiPlannerModal
                        onClose={() => setIsAiModalOpen(false)}
                        onSuccess={(newTrip) => {
                            setTrips([newTrip, ...trips]);
                            setIsAiModalOpen(false);
                            triggerConfetti();
                            notify("AI đã hoàn tất cuốn sổ tay mới của bạn!", "🎉", "success");
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

/* ============================================================
   4. SUB-COMPONENTS (CARDS & MODALS)
   ============================================================ */

/* --- POLAROID CARD COMPONENT --- */
interface PolaroidCardProps {
    trip: Trip;
    index: number;
    rank?: number;
    isTrending?: boolean;
    showProgress?: boolean;
    onOpenDetail: () => void;
    onClone: () => void;
    onLike: (e: React.MouseEvent) => void;
}

function PolaroidCard({
    trip,
    index,
    rank,
    isTrending = false,
    showProgress = false,
    onOpenDetail,
    onClone,
    onLike,
}: PolaroidCardProps) {
    // Generate slightly randomized tilt for scrapbook feel
    const tilts = [-2.5, 1.8, -1.2, 2.2, -1.8, 1.5];
    const defaultRotate = tilts[index % tilts.length];

    const washiColors = [
        "var(--washi-teal)",
        "var(--washi-coral)",
        "var(--washi-yellow)",
    ];
    const washiColor = washiColors[index % washiColors.length];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, rotate: defaultRotate }}
            whileHover={{
                rotate: 0,
                y: -8,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            onClick={onOpenDetail}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-[24px] shadow-sm hover:shadow-[var(--shadow-float)] transition-all cursor-pointer flex flex-col justify-between relative group"
        >
            {/* Washi Tape on top edge */}
            <WashiTape
                color={washiColor}
                className="top-[-8px] left-1/2 -translate-x-1/2 w-28 -rotate-2"
            />

            {/* Top Rank Badge if trending */}
            {rank && (
                <div className="absolute -top-3 -left-3 z-20 w-9 h-9 rounded-2xl bg-[var(--accent-primary)] text-white font-display font-extrabold text-sm flex items-center justify-center shadow-md rotate-[-10deg]">
                    #{rank}
                </div>
            )}

            {/* Image Container */}
            <div>
                <div className="relative h-52 w-full rounded-[16px] overflow-hidden bg-slate-100">
                    <img
                        src={trip.coverImage}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    {/* Top image overlay */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <span className="bg-black/40 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
                            <Clock className="w-3 h-3 text-[var(--accent-gold)]" />{" "}
                            {trip.days}N{trip.days - 1}Đ
                        </span>

                        <button
                            onClick={onLike}
                            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-[var(--accent-primary)] hover:scale-110 transition-all border border-white/10"
                            title="Yêu thích"
                        >
                            <Heart className="w-4 h-4 fill-white/20" />
                        </button>
                    </div>

                    {/* Bottom image overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10 text-white">
                        <div className="flex items-center gap-1 text-xs font-bold drop-shadow">
                            <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                            <span className="truncate">{trip.destination}</span>
                        </div>
                    </div>
                </div>

                {/* Card Content */}
                <div className="pt-4">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] mb-1.5">
                        <span>
                            {trip.startDate ? `${trip.startDate}` : "Lịch linh hoạt"}
                        </span>
                        {trip.budget && (
                            <span className="text-[var(--accent-gold)] font-bold">
                                {trip.budget}
                            </span>
                        )}
                    </div>

                    <h3 className="font-display font-bold text-base leading-snug group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2">
                        {trip.title}
                    </h3>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {trip.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-[10px] font-semibold bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-muted)] px-2 py-0.5 rounded-md"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Progress bar for ongoing planning */}
                    {showProgress && trip.progress !== undefined && (
                        <div className="mt-4 pt-3 border-t border-dashed border-[var(--border-color)]">
                            <div className="flex justify-between text-xs mb-1.5 font-medium">
                                <span className="text-[var(--text-muted)]">
                                    Chuẩn bị hành trang:
                                </span>
                                <span className="font-bold text-[var(--accent-primary)] font-display">
                                    {trip.progress}%
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-[var(--bg-paper)] rounded-full overflow-hidden border border-[var(--border-color)]">
                                <div
                                    className="h-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-primary)] rounded-full transition-all duration-500"
                                    style={{ width: `${trip.progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Card Footer */}
            <div className="mt-5 pt-3.5 border-t border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {trip.author.avatar.startsWith("http") ? (
                        <img
                            src={trip.author.avatar}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <span className="w-6 h-6 rounded-full bg-[var(--accent-gold)] text-white font-bold text-[10px] flex items-center justify-center">
                            {trip.author.avatar}
                        </span>
                    )}
                    <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                        {trip.author.name}
                        {trip.author.verified && (
                            <CheckCircle2 className="w-3 h-3 text-[var(--accent-secondary)] shrink-0" />
                        )}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {isTrending && (
                        <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1 bg-[var(--bg-paper)] px-2 py-1 rounded-lg">
                            <Copy className="w-3 h-3" /> {trip.clonedCount}
                        </span>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClone();
                        }}
                        className="p-2 rounded-xl bg-[var(--bg-paper)] hover:bg-[var(--accent-primary)] text-[var(--text-main)] hover:text-white transition-colors border border-[var(--border-color)] hover:border-transparent"
                        title="Clone lộ trình này"
                    >
                        <BookmarkPlus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

/* --- MODAL 1: TRIP SPREAD DETAIL --- */
function TripDetailModal({
    trip,
    onClose,
    onClone,
}: {
    trip: Trip;
    onClose: () => void;
    onClone: () => void;
}) {
    const [activeTab, setActiveTab] = useState<"itinerary" | "checklist">(
        "itinerary"
    );
    const [checklist, setChecklist] = useState(trip.checklist || []);

    const toggleCheck = (idx: number) => {
        setChecklist((prev) =>
            prev.map((item, i) =>
                i === idx ? { ...item, checked: !item.checked } : item
            )
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Notebook Box */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[85vh]"
            >
                {/* Left Column: Cover & Summary */}
                <div className="md:w-5/12 bg-[var(--bg-bento)] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border-color)] relative">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] font-display bg-[var(--bg-card)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                                {trip.days} Ngày Trải Nghiệm
                            </span>
                            <button
                                onClick={onClose}
                                className="md:hidden p-1 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-md mb-6">
                            <img
                                src={trip.coverImage}
                                alt={trip.title}
                                className="w-full h-full object-cover"
                            />
                            <WashiTape
                                color="var(--washi-coral)"
                                className="top-3 left-3 w-24 -rotate-6"
                            />
                        </div>

                        <h2 className="font-display text-2xl font-bold leading-snug">
                            {trip.title}
                        </h2>
                        <p className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-1.5 mt-2">
                            <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
                            <span>{trip.destination}</span>
                        </p>

                        <div className="mt-6 space-y-2.5 pt-6 border-t border-[var(--border-color)] text-xs font-semibold">
                            <div className="flex justify-between">
                                <span className="text-[var(--text-muted)]">Ngân sách dự kiến:</span>
                                <span className="text-[var(--accent-gold)] font-bold text-sm">
                                    {trip.budget || "Tự túc / Linh hoạt"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-muted)]">Tác giả lộ trình:</span>
                                <span>{trip.author.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 flex gap-3">
                        <button
                            onClick={() => {
                                onClone();
                                onClose();
                            }}
                            className="flex-1 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                            <BookmarkPlus className="w-4 h-4" /> Clone vào sổ tay
                        </button>
                        <button
                            onClick={() =>
                                notify("Đã sao chép liên kết chia sẻ lộ trình!", "🔗")
                            }
                            className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            title="Chia sẻ"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right Column: Day-by-Day Itinerary Spread */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-paper)]">
                    {/* Header tabs */}
                    <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab("itinerary")}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "itinerary"
                                    ? "bg-[var(--text-main)] text-[var(--bg-paper)] shadow-sm"
                                    : "bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                    }`}
                            >
                                <Navigation className="w-3.5 h-3.5" /> Lịch trình chi tiết
                            </button>
                            <button
                                onClick={() => setActiveTab("checklist")}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "checklist"
                                    ? "bg-[var(--text-main)] text-[var(--bg-paper)] shadow-sm"
                                    : "bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                    }`}
                            >
                                <Luggage className="w-3.5 h-3.5" /> Hành trang ({checklist.filter((c) => c.checked).length}/{checklist.length})
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="hidden md:flex p-2 rounded-full hover:bg-[var(--bg-paper)] text-[var(--text-muted)] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body Content */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                        {activeTab === "itinerary" ? (
                            trip.itinerary && trip.itinerary.length > 0 ? (
                                <div className="space-y-8 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--border-color)]">
                                    {trip.itinerary.map((plan) => (
                                        <div key={plan.day} className="relative pl-8">
                                            {/* Day Pill */}
                                            <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-[var(--accent-gold)] text-white font-display font-bold text-xs flex items-center justify-center shadow-sm z-10">
                                                D{plan.day}
                                            </div>

                                            <h4 className="font-display font-bold text-base">
                                                {plan.title}
                                            </h4>

                                            <div className="mt-3 space-y-2.5">
                                                {plan.activities.map((act, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-medium leading-relaxed flex items-start gap-2.5 shadow-sm"
                                                    >
                                                        <Coffee className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                                                        <span>{act}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-[var(--text-muted)]">
                                    <Compass className="w-10 h-10 mx-auto opacity-30 mb-2 animate-spin-slow" />
                                    <p className="text-sm font-medium">
                                        Lộ trình chi tiết đang được tác giả cập nhật thêm...
                                    </p>
                                </div>
                            )
                        ) : (
                            /* Checklist Tab */
                            <div className="space-y-3">
                                <p className="font-hand text-base text-[var(--text-muted)] mb-4">
                                    * Chạm vào từng món đồ để đánh dấu đã chuẩn bị xong nhé:
                                </p>
                                {checklist.length > 0 ? (
                                    checklist.map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => toggleCheck(idx)}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-sm font-semibold ${item.checked
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 line-through opacity-80"
                                                : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--text-main)]"
                                                }`}
                                        >
                                            <span>{item.item}</span>
                                            {item.checked ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-12 text-sm text-[var(--text-muted)]">
                                        Chưa có danh sách hành lý cho chuyến đi này.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/* --- MODAL 2: AI TRAVEL PLANNER --- */
function AiPlannerModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: (trip: Trip) => void;
}) {
    const [prompt, setPrompt] = useState("");
    const [days, setDays] = useState(3);
    const [style, setStyle] = useState("Thư giãn & Healing");
    const [isGenerating, setIsGenerating] = useState(false);
    const [stepText, setStepText] = useState("");

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) {
            notify("Vui lòng nhập điểm đến hoặc ý tưởng chuyến đi", "⚠️");
            return;
        }

        setIsGenerating(true);
        setStepText("AI đang phân tích thời tiết & mùa du lịch...");

        setTimeout(() => {
            setStepText("Đang tổng hợp các quán ăn local ngon-bổ-rẻ...");
        }, 1200);

        setTimeout(() => {
            setStepText("Đang vẽ bản đồ di chuyển tối ưu nhất...");
        }, 2400);

        setTimeout(() => {
            const newTrip: Trip = {
                id: `ai-${Date.now()}`,
                title: `Lộ trình ${days} ngày: ${prompt} (${style})`,
                destination: prompt.split(" ")[0] || "Việt Nam",
                days: days,
                coverImage:
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
                startDate: "2026-09-01",
                endDate: `2026-09-0${days}`,
                tags: [style.split(" ")[0], "AI Gợi ý", "Tự túc"],
                isPublic: false,
                author: { name: "AI Agent 🤖", avatar: "🤖", verified: true },
                clonedCount: 0,
                likesCount: 1,
                progress: 15,
                budget: `${days * 1.2}00.000đ / người`,
                itinerary: [
                    {
                        day: 1,
                        title: "Khám phá trung tâm & Nhịp sống bản địa",
                        activities: [
                            "08:00 - Ăn sáng đặc sản địa phương & Cafe sáng",
                            "10:30 - Check-in khách sạn/homestay, cất hành lý",
                            "15:30 - Tham quan điểm check-in nổi tiếng nhất khu vực",
                        ],
                    },
                    {
                        day: 2,
                        title: "Trải nghiệm thiên nhiên & Ẩm thực đường phố",
                        activities: [
                            "07:00 - Khởi hành đi cụm điểm tham quan ngoại ô",
                            "12:00 - Thưởng thức bữa trưa tại quán local view đẹp",
                            "17:00 - Săn hoàng hôn & Khám phá chợ đêm ẩm thực",
                        ],
                    },
                ],
                checklist: [
                    { item: "Đồ trang phục phù hợp thời tiết", checked: true },
                    { item: "Giày thể thao đi bộ thoải mái", checked: false },
                    { item: "Thuốc tiêu hóa & băng cá nhân", checked: false },
                ],
            };
            onSuccess(newTrip);
        }, 3500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isGenerating && onClose()}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
            >
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-gold)] rounded-full blur-3xl opacity-20 pointer-events-none" />

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-gold)] flex items-center justify-center text-white shadow-md">
                            <Sparkles className="w-5 h-5 animate-spin-slow" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-lg">
                                AI Travel Designer
                            </h3>
                            <p className="text-xs text-[var(--text-muted)] font-medium">
                                Soạn thảo lộ trình cá nhân hóa trong vài giây
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="p-2 rounded-full hover:bg-[var(--bg-paper)] text-[var(--text-muted)] transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isGenerating ? (
                    /* Generating State */
                    <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-[var(--accent-primary)]/20 animate-ping" />
                            <div className="w-full h-full rounded-full border-4 border-t-[var(--accent-primary)] border-r-[var(--accent-gold)] border-b-transparent border-l-transparent animate-spin" />
                            <CompassIcon className="w-6 h-6 text-[var(--accent-primary)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <h4 className="font-display font-bold text-base animate-pulse text-[var(--text-main)]">
                            {stepText}
                        </h4>
                        <p className="text-xs text-[var(--text-muted)] max-w-xs">
                            AI đang tính toán khoảng cách di chuyển và sắp xếp thời gian hợp lý
                            nhất cho bạn...
                        </p>
                    </div>
                ) : (
                    /* Input Form State */
                    <form onSubmit={handleGenerate} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                                Bạn muốn đi đâu hoặc trải nghiệm gì? *
                            </label>
                            <textarea
                                rows={3}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="VD: Phú Yên 3 ngày cùng nhóm bạn 4 người, thích ngắm hoàng hôn, ăn hải sản rẻ và chụp ảnh film..."
                                className="w-full p-4 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm font-medium outline-none focus:border-[var(--accent-primary)] transition-colors resize-none leading-relaxed"
                                required
                            />
                        </div>

                        {/* Quick Chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {[
                                "Nghỉ dưỡng Đà Lạt",
                                "Food Tour Hải Phòng",
                                "Phượt xe máy Hà Giang",
                                "Biển Phú Quý",
                            ].map((hint) => (
                                <button
                                    key={hint}
                                    type="button"
                                    onClick={() => setPrompt(hint)}
                                    className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all"
                                >
                                    + {hint}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                                    Thời gian
                                </label>
                                <select
                                    value={days}
                                    onChange={(e) => setDays(Number(e.target.value))}
                                    className="w-full p-3.5 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm font-bold outline-none focus:border-[var(--accent-primary)] transition-colors"
                                >
                                    <option value={2}>2 Ngày 1 Đêm (Cuối tuần)</option>
                                    <option value={3}>3 Ngày 2 Đêm (Phổ biến)</option>
                                    <option value={4}>4 Ngày 3 Đêm (Khám phá sâu)</option>
                                    <option value={5}>5 Ngày 4 Đêm (Nghỉ dưỡng dài)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                                    Phong cách du lịch
                                </label>
                                <select
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                    className="w-full p-3.5 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-sm font-bold outline-none focus:border-[var(--accent-primary)] transition-colors"
                                >
                                    <option value="Thư giãn & Healing">🌿 Chữa lành & Chill</option>
                                    <option value="Ẩm thực & Food Tour">🍜 Ăn sập địa phương</option>
                                    <option value="Nhiếp ảnh & Check-in">📸 Sống ảo & Cafe</option>
                                    <option value="Trekking & Khám phá">⛰️ Mạo hiểm & Trekking</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border-color)]">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-3 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-paper)] transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-gold)] text-white text-xs font-bold shadow-lg shadow-[var(--accent-primary)]/25 hover:opacity-95 transition-all flex items-center gap-2"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>Bắt đầu tạo lộ trình</span>
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}