import { Users } from "lucide-react";

export default function CommunityPage() {
    return (
        <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)]">
                <Users className="w-10 h-10 opacity-40" />
            </div>
            <h3 className="font-display text-2xl font-bold">Cộng đồng Journify</h3>
            <p className="text-[var(--text-muted)] max-w-md mx-auto mt-2">Sắp ra mắt! Kết nối với những người yêu thích du lịch, chia sẻ lộ trình và khám phá thế giới cùng nhau.</p>
        </div>
    );
}