/* eslint-disable @next/next/no-img-element */
import { Itinerary } from "@/interface";
import { BookmarkPlus, TrendingUp } from "lucide-react";

export const TrendingCard = ({ trip, rank, onOpen, onClone }: { trip: Itinerary; rank: number; onOpen: () => void; onClone: () => void }) => {
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