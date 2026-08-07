import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Type, ArrowRight, Sparkles } from "lucide-react";

interface CreateTripModalProps {
    onClose: () => void;
    // Truyền danh sách tỉnh thành từ DB vào đây
    provinces: { id: string; name: string }[];
    // Hàm xử lý khi bấm submit (Gọi API tạo nháp -> Redirect sang trang Builder)
    onSubmit: (data: { title: string; province_id: string; start_date: string; end_date: string }) => void;
}

export const CreateTripModal = ({ onClose, provinces, onSubmit }: CreateTripModalProps) => {
    const [formData, setFormData] = useState({
        title: "",
        province_id: "",
        start_date: "",
        end_date: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Gọi hàm onSubmit truyền từ component cha vào
        onSubmit(formData);

        // Lưu ý: Việc set isSubmitting(false) hoặc onClose() nên được 
        // xử lý ở component cha sau khi gọi API thành công.
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden z-10"
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-[var(--accent-primary)] to-purple-600 p-6 text-white overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><Sparkles className="w-16 h-16" /></div>
                        <h2 className="relative z-10 font-display text-2xl font-bold mb-1">Bắt đầu hành trình</h2>
                        <p className="relative z-10 text-sm text-indigo-100">Khởi tạo chuyến đi tuyệt vời tiếp theo của bạn.</p>

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">

                        {/* 1. Điểm đến (Province) */}
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" /> Điểm đến chính
                            </label>
                            <select
                                required
                                value={formData.province_id}
                                onChange={(e) => setFormData({ ...formData, province_id: e.target.value })}
                                className="w-full bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all appearance-none"
                            >
                                <option value="" disabled>Chọn Tỉnh/Thành phố...</option>
                                {provinces.map(prov => (
                                    <option key={prov.id} value={prov.id}>{prov.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Tên chuyến đi */}
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Type className="w-3.5 h-3.5" /> Tên chuyến đi
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                                placeholder="Vd: Chuyến đi thanh xuân Đà Lạt..."
                            />
                        </div>

                        {/* 3. Ngày đi & Ngày về (Grid 2 cột) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Ngày đi
                                </label>
                                <input
                                    required
                                    type="date"
                                    value={formData.start_date}
                                    // Chặn chọn ngày trong quá khứ
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Ngày về
                                </label>
                                <input
                                    required
                                    type="date"
                                    value={formData.end_date}
                                    // Chặn chọn ngày về trước ngày đi
                                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">Đang khởi tạo...</span>
                                ) : (
                                    <span className="flex items-center gap-2">Tiếp tục lên kế hoạch <ArrowRight className="w-4 h-4" /></span>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};