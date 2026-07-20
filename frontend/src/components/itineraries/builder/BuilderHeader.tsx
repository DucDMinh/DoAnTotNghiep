import { Map, ArrowLeft, Save, DollarSign } from "lucide-react";
interface BuilderHeaderProps {
    totalCost: number;
    selectedProvinces: { id: string; name: string }[];
    onBack: () => void;
    onSave: () => void;
}
export const BuilderHeader = ({ totalCost, selectedProvinces, onBack, onSave }: BuilderHeaderProps) => {
    return (
        <>
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
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
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 text-green-700">
                    <DollarSign className="h-5 w-5" />
                    <div>
                        <p className="text-xs font-semibold">Tổng dự kiến</p>
                        {/* Dùng totalCost từ props truyền vào */}
                        <p className="text-lg font-bold">{totalCost.toLocaleString('vi-VN')} đ</p>
                    </div>
                </div>
                <button
                    onClick={onSave}
                    className="flex items-center rounded-xl bg-brand-600 px-6 py-2.5 font-bold text-white">
                    <Save className="mr-2 h-4 w-4" /> Lưu
                </button>
            </div>
        </>
    )
}