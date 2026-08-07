/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";
import { AppHeader } from "@/layout/user/AppHeader"; // Đổi đường dẫn cho đúng với dự án của bạn
import { usePathname } from "next/navigation";
import GlobalStyles from "@/components/user/GlobalStyles";
import { useAuth } from "@/hooks/auth/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { Itinerary } from "@/interface";
import { CompassIcon, Send, Sparkles, X } from "lucide-react";
import { CreateTripModal } from "@/components/modals/user/CreateTripModal";

// 1. Định nghĩa kiểu dữ liệu gộp chung cho cả notify và setIsCreatingTrip
type DashboardContextType = {
    notify: (msg: string, icon?: string) => void;
    setIsCreatingTrip: React.Dispatch<React.SetStateAction<boolean>>; // Khai báo kiểu cho hàm set state
};

// 2. Khởi tạo Context mới (thay thế cho NotifyContext cũ)
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// 3. Tạo Custom Hook mới
export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error("useDashboard phải được sử dụng bên trong UserDashboardLayout");
    }
    return context;
};

export default function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeNav, setActiveNav] = useState("dashboard");
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isCreatingTrip, setIsCreatingTrip] = useState(false);
    const [theme, setTheme] = useState<"day" | "night">("day");
    const { user: currentUser } = useAuth();
    useEffect(() => {
        if (pathname === "/") setActiveNav("dashboard");
        else if (pathname.includes("/MyItinerary")) setActiveNav("trips");
        else if (pathname.includes("/wishlist")) setActiveNav("wishlist");
    }, [pathname]);
    useEffect(() => {
        if (theme === "night") {
            document.documentElement.classList.add("theme-night");
        } else {
            document.documentElement.classList.remove("theme-night");
        }
    }, [theme]);
    const notify = (msg: string, icon = "✨") => {
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
    };

    return (
        <DashboardContext.Provider value={{ notify, setIsCreatingTrip }}>
            <div className="min-h-screen paper-grid selection:bg-[var(--accent-primary)] selection:text-white">
                <GlobalStyles />
                <AppHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setActiveNav={setActiveNav}
                    setIsAiModalOpen={setIsAiModalOpen}
                    notify={notify}
                    setIsCreatingTrip={setIsCreatingTrip}
                    setTheme={setTheme}
                    currentUser={currentUser}
                    theme={theme}
                    activeNav={activeNav}
                />

                <main className="pb-20">
                    {children}
                </main>
                <AnimatePresence>
                    {isAiModalOpen && (
                        <AiPlannerModal
                            onClose={() => setIsAiModalOpen(false)}
                            onSuccess={(newTrip) => {
                            }}
                        />
                    )}
                </AnimatePresence><AnimatePresence>
                    {isCreatingTrip && (
                        <CreateTripModal
                            onClose={() => setIsCreatingTrip(false)}
                            provinces={[]}
                            onSubmit={() => { }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </DashboardContext.Provider>
    );
}
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