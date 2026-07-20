import { Province, Location } from "@/interface";
import { CheckCircle2, Filter, Search } from "lucide-react";
import { DraggableLocationCard } from "./DraggableLocationCard";
import { useState, useMemo } from "react";

interface LocationSidebarProp {
    selectedProvinces: Province[];
    locations: Location[];
    onAddLocation?: (loc: Location) => void;
}

export const LocationSidebar = ({ selectedProvinces, locations, onAddLocation }: LocationSidebarProp) => {
    const [searchTerm, setSearchTerm] = useState("");
    const filteredLocations = useMemo(() => {
        if (!searchTerm.trim()) return locations;
        return locations.filter(loc =>
            loc.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [locations, searchTerm]);

    return (
        <div className="col-span-1 xl:col-span-4 border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 flex flex-col sticky top-[80px] h-[calc(100vh-80px)] self-start">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Kho Địa Điểm</h3>
                <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="truncate" title={selectedProvinces.length > 0 ? `Đang gợi ý các điểm tại ${selectedProvinces.map(p => p.name).join(", ")}` : "Đang hiển thị tất cả địa điểm"}>
                        {selectedProvinces.length > 0
                            ? `Đang gợi ý điểm tại ${selectedProvinces.map(p => p.name).join(", ")}`
                            : "Đang hiển thị tất cả địa điểm"}
                    </span>
                </p>

                <div className="flex gap-2">
                    <div className="relative flex flex-1 shadow-sm rounded-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Tìm tên địa điểm..."
                            value={searchTerm} // 🌟 Gắn state
                            onChange={(e) => setSearchTerm(e.target.value)} // 🌟 Cập nhật state khi gõ
                            className="w-full rounded-l-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                        <button
                            type="button"
                            className="flex items-center justify-center rounded-r-lg border border-l-0 border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Tìm
                        </button>
                    </div>
                    <button className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                        <Filter className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-5 pb-32 custom-scrollbar">
                {(() => {
                    return filteredLocations.length > 0 ? (
                        filteredLocations.map((loc) => (
                            <DraggableLocationCard
                                key={loc.id}
                                loc={loc}
                                onAdd={() => onAddLocation?.(loc)}
                            />
                        ))
                    ) : (
                        <div className="py-12 text-center text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                            Không tìm thấy địa điểm phù hợp.
                        </div>
                    );
                })()}
            </div>
        </div>
    )
}