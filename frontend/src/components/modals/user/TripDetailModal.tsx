
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { Itinerary, Itinerary_days, Itinerary_locations, User } from "@/interface";
import { BookmarkPlus, CheckCircle2, Circle, Coffee, Compass, Luggage, MapPin, Share2, X, Navigation } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNotify } from "@/app/user/(dashboard)/layout";

export const TripDetailModal = ({ itinerary, onClose, onClone, currentUser }: { itinerary: Itinerary; onClose: () => void; onClone: () => void, currentUser: User | null }) => {
    const [activeTab, setActiveTab] = useState<"itinerary" | "checklist">("itinerary");
    const destination = itinerary.itinerary_provinces?.map(ip => ip.provinces?.name).join(" - ") || "Việt Nam";
    const defaultChecklist = [
        { item: "Căn cước công dân / Hộ chiếu", checked: true },
        { item: "Quần áo phù hợp theo thời tiết", checked: false },
        { item: "Sạc dự phòng & dây cáp", checked: false },
        { item: "Đồ dùng cá nhân", checked: false }
    ];
    const notify = useNotify();
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
                            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Tác giả lộ trình:</span><span>{itinerary.user_id?.name || currentUser?.name}</span></div>
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