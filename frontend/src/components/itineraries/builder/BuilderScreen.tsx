import {
    DollarSign, MapPin,
    Plus, Trash2, Search, Filter, Map, CheckCircle2, X
} from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { BuilderScreenProp, Itinerary_locations } from "@/interface";
import React from "react";
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { Compass } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useItineraryBuilder } from "@/hooks/Itineraries/useItineraryBuilder";
import { BuilderHeader } from "./BuilderHeader";
import { GeneralInfoForm } from "./GeneralInfoForm";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-900 text-sm text-gray-400">
            <Compass className="h-8 w-8 animate-spin text-brand-400 mb-3" />
            <span className="font-medium tracking-wider text-xs uppercase text-gray-400">Đang tải bản đồ...</span>
        </div>
    ),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DraggableLocationCard = ({ loc }: { loc: any }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `drag-loc-${loc.id}`,
        data: { location: loc }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`group relative flex cursor-grab items-center gap-3 rounded-xl border p-3 shadow-sm transition-all active:cursor-grabbing ${isDragging ? 'opacity-40 border-brand-300' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 hover:border-brand-300 hover:shadow-md'
                }`}
        >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={loc.image_url || loc.img} alt={loc.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 pointer-events-none">
                <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">{loc.name}</h4>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <span className="text-green-500 font-medium">{loc.difficulty_level || loc.difficulty}</span>
                </div>
            </div>
        </div>
    );
};
const DroppableActivityZone = ({
    dayId,
    loc,
    onUpdate,
    onOpenMap
}: {
    dayId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loc: any, onUpdate: any,
    onOpenMap: (dayId: string, locId: string) => void
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `drop-activity-${dayId}-${loc.id}`,
        data: { type: 'existing-activity', dayId, activityId: loc.id }
    });

    const [isSearchingLoc, setIsSearchingLoc] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    return (
        <div
            ref={setNodeRef}
            className={`relative flex items-center rounded-lg border bg-white transition-all overflow-hidden h-[42px] ${isOver
                ? 'border-brand-500 bg-brand-50 shadow-md ring-2 ring-brand-500/20 dark:bg-brand-900/30'
                : 'border-gray-200 dark:border-gray-600 dark:bg-gray-800'
                }`}
        >
            <input
                type="text"
                placeholder={
                    isOver
                        ? "✨ Thả địa điểm vào đây..."
                        : "Gõ tên, kéo thả, hoặc chọn Map..."
                }
                value={loc.location_name || ''}
                onChange={(e) => {
                    const newValue = e.target.value;
                    if (loc.location_id) {
                        onUpdate(dayId, loc.id, {
                            location_name: newValue,
                            location_id: "", // xóa liên kết cũ
                        });
                    } else {
                        onUpdate(dayId, loc.id, { location_name: newValue });
                    }
                }}
                onBlur={async (e) => {
                    const typedName = e.target.value.trim();
                    if (!typedName) return;
                    if (isSearchingLoc) return;
                    if (abortControllerRef.current) {
                        abortControllerRef.current.abort();
                    }
                    const controller = new AbortController();
                    abortControllerRef.current = controller;

                    try {
                        setIsSearchingLoc(true);

                        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                            typedName
                        )}&format=json&limit=1&countrycodes=vn&accept-language=vi`;

                        const res = await fetch(url, {
                            headers: {
                                'User-Agent': 'MyTravelApp/1.0 (daod1278@example.com)', // THAY BẰNG TÊN & EMAIL THẬT CỦA BẠN
                            },
                            signal: controller.signal,
                        });

                        if (!res.ok) throw new Error('Network response was not ok');
                        const data = await res.json();

                        if (Array.isArray(data) && data.length > 0) {
                            const { lat, lon, display_name } = data[0];
                            onUpdate(dayId, loc.id, {
                                lat: parseFloat(lat),
                                lng: parseFloat(lon),
                                location_name: typedName,
                                display_name,
                            });

                            toast.success(
                                `Đã ghim: ${display_name.split(',').slice(0, 3).join(',')}`
                            );
                        } else {
                            onUpdate(dayId, loc.id, {
                                lat: null,
                                lng: null,
                                location_name: typedName,
                            });

                            toast.error(
                                `Không tìm thấy "${typedName}". Vui lòng ghim lại trên Bản đồ!`,
                                { duration: 4000, icon: '⚠️' }
                            );
                        }
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } catch (err: any) {
                        if (err.name === 'AbortError') return;
                        console.error('Lỗi tìm tọa độ:', err);
                        toast.error('Lỗi kết nối tới hệ thống bản đồ.');
                    } finally {
                        setIsSearchingLoc(false);
                        abortControllerRef.current = null;
                    }
                }}
                className={`flex-1 min-w-0 bg-transparent px-3 text-sm font-medium outline-none placeholder:text-gray-400 dark:text-white ${isOver ? 'text-brand-600' : ''
                    }`}
            />

            <div className="flex h-full items-center shrink-0">
                {isSearchingLoc ? (
                    <div className="flex h-full items-center px-3 border-l border-gray-100 dark:border-gray-700 bg-gray-50 text-brand-500">
                        <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : loc.location_id ? (
                    <div className="flex h-full items-center px-3 border-l border-gray-100 dark:border-gray-700 bg-green-50 dark:bg-green-900/20 text-green-600" title="Địa điểm chuẩn từ hệ thống">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                ) : (
                    <button
                        onClick={() => onOpenMap(dayId, loc.id)}
                        className="flex h-full items-center justify-center gap-1.5 border-l border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-brand-400"
                    >
                        <Map className="h-4 w-4" /> Bản đồ
                    </button>
                )}
            </div>
        </div>
    );
};
const DroppableAddButton = ({ dayId, onAdd }: { dayId: string, onAdd: () => void }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `drop-new-${dayId}`,
        data: { type: 'new-activity', dayId }
    });

    return (
        <button
            ref={setNodeRef}
            onClick={onAdd}
            className={`flex w-full items-center justify-center rounded-xl border-2 border-dashed py-3 text-sm font-medium transition-all ${isOver ? 'border-brand-500 bg-brand-50 text-brand-600 scale-[1.02] shadow-sm dark:bg-brand-900/30 dark:text-brand-400'
                : 'border-gray-200 bg-gray-50/50 text-gray-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800/30'
                }`}
        >
            <Plus className="mr-2 h-4 w-4" />
            {isOver ? "✨ Thả để tạo ngay hoạt động mới!" : "Thêm hoạt động (hoặc Kéo thả vào đây)"}
        </button>
    );
};
export const BuilderScreen: React.FC<BuilderScreenProp> = (props) => {
    const { setStep,
        selectedProvinces,
        currentItinerary,
        setCurrentItinerary,
        locations,
        setSelectedProvinces } = props;
    const { days,
        calculateTotalCost,
        activeDragLoc,
        isMapModalOpen,
        handleDragStart,
        handleDragEnd,
        setIsMapModalOpen,
        handleUpdateActivity,
        setDays,
        handleAddItinerary } = useItineraryBuilder(props);

    const [currentActiveDayId, setCurrentActiveDayId] = useState<string | null>(null);
    const [currentActiveLocId, setCurrentActiveLocId] = useState<string | null>(null);
    const handleAddActivity = (dayId: string) => {
        setDays(prevDays => prevDays.map(day => {
            if (day.id === dayId) {
                const newActivity: Itinerary_locations = {
                    id: uuidv4(),
                    day_id: day.id,
                    location_id: "",
                    sequence_order: (day.itinerary_locations?.length || 0) + 1,
                    activity_note: "",
                    cost: 0,
                    start_time: "08:00",
                    end_time: "10:00",
                    location_name: "",
                    lat: 0,
                    lng: 0
                };

                return {
                    ...day,
                    itinerary_locations: [...(day.itinerary_locations || []), newActivity]
                };
            }
            return day;
        }));
    };
    const handleRemoveActivity = (dayId: string, activityId: string) => {
        setDays(prevDays => prevDays.map(day => {
            if (day.id === dayId) {
                return {
                    ...day,
                    itinerary_locations: day.itinerary_locations.filter((loc: Itinerary_locations) => loc.id !== activityId)
                };
            }
            return day;
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-950 font-sans animate-in fade-in zoom-in-95 duration-300">
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
                <BuilderHeader
                    totalCost={calculateTotalCost()}
                    selectedProvinces={selectedProvinces}
                    onBack={() => {
                        setStep("SETUP");
                        setCurrentItinerary(undefined);
                    }}
                    onSave={() => {
                        handleAddItinerary();
                        setCurrentItinerary(undefined);
                        setSelectedProvinces([]);
                    }}
                />
            </header>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-0 overflow-hidden h-[calc(100vh-80px)]">
                    <div className="col-span-1 xl:col-span-8 overflow-y-auto p-6 lg:p-8 custom-scrollbar pb-32">
                        <GeneralInfoForm
                            currentItinerary={currentItinerary}
                            setCurrentItinerary={setCurrentItinerary}
                        />
                        <div className="space-y-6">
                            {days.length > 0 ? days.map((day) => (
                                <motion.div key={day.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">                              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white dark:bg-white dark:text-gray-900">{day.day_number}</div>
                                        <input type="text" defaultValue={day.title} className="w-full border-none bg-transparent font-bold text-gray-900 focus:ring-0 dark:text-white outline-none" />
                                    </div>
                                </div>
                                    <div className="p-4 space-y-4">
                                        {day.itinerary_locations?.map((loc: Itinerary_locations) => (
                                            <div key={loc.id} className="group relative flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50 hover:border-brand-300 transition-colors">
                                                <button
                                                    onClick={() => handleRemoveActivity(day.id, loc.id)}
                                                    className="absolute right-3 top-3 p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-all dark:hover:bg-red-900/30"
                                                    title="Xóa hoạt động này"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>

                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                                    <div className="lg:col-span-5">
                                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Địa điểm</label>
                                                        {loc.location_id ? (
                                                            <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 p-2 text-sm dark:border-brand-900/50 dark:bg-brand-900/20 h-[42px]">
                                                                <div className="flex items-center gap-2 truncate">
                                                                    <MapPin className="h-4 w-4 text-brand-500 shrink-0" />
                                                                    <span className="font-medium text-brand-700 dark:text-brand-400 truncate" title={loc.location_name}>

                                                                        {loc.location_name}

                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        handleUpdateActivity(day.id, loc.id, 'location_id', "");
                                                                        handleUpdateActivity(day.id, loc.id, 'location_name', "");
                                                                    }}
                                                                    className="text-xs text-gray-400 hover:text-red-500 px-2 shrink-0 transition-colors"
                                                                >
                                                                    Gỡ
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="lg:col-span-5">
                                                                <DroppableActivityZone
                                                                    dayId={day.id}
                                                                    loc={loc}
                                                                    onUpdate={handleUpdateActivity}
                                                                    onOpenMap={(dId, lId) => {
                                                                        setIsMapModalOpen(true);
                                                                        setCurrentActiveDayId(dId);
                                                                        setCurrentActiveLocId(lId);
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="lg:col-span-4 flex gap-2">
                                                        <div className="flex-1">
                                                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Từ</label>
                                                            <input
                                                                type="time"
                                                                value={loc.start_time}
                                                                onChange={(e) => handleUpdateActivity(day.id, loc.id, 'start_time', e.target.value)}
                                                                className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white h-[42px] [color-scheme:light_dark]"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Đến</label>
                                                            <input
                                                                type="time"
                                                                value={loc.end_time}
                                                                onChange={(e) => handleUpdateActivity(day.id, loc.id, 'end_time', e.target.value)}
                                                                className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white h-[42px] [color-scheme:light_dark]"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="lg:col-span-3">
                                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Chi phí (VNĐ)</label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                            <input
                                                                type="number"
                                                                placeholder="0"
                                                                value={loc.cost || ''}
                                                                onChange={(e) => handleUpdateActivity(day.id, loc.id, 'cost', Number(e.target.value))}
                                                                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white h-[42px]"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Ghi chú (VD: Lên đồ đẹp chụp hình, vé vào cổng mua trước...)"
                                                        value={loc.activity_note}
                                                        onChange={(e) => handleUpdateActivity(day.id, loc.id, 'activity_note', e.target.value)}
                                                        className="w-full rounded-lg border border-transparent bg-transparent p-2 text-sm text-gray-700 placeholder-gray-400 hover:border-gray-200 hover:bg-white focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-900 dark:focus:bg-gray-900"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <div className="p-4">
                                            <DroppableAddButton dayId={day.id} onAdd={() => handleAddActivity(day.id)} />
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white/50 dark:bg-gray-900/50">
                                    Chưa có lịch trình ngày nào. Nhập ngày khởi hành và kết thúc để bắt đầu
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-1 xl:col-span-4 border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 flex flex-col h-full">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Kho Địa Điểm</h3>
                            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                {selectedProvinces.length > 0
                                    ? `Đang gợi ý các điểm tại ${selectedProvinces.map(p => p.name).join(", ")}`
                                    : "Đang hiển thị tất cả địa điểm"}
                            </p>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="text" placeholder="Tìm tên địa điểm..." className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm" />
                                </div>
                                <button className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 shadow-sm">
                                    <Filter className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar pb-32">
                            {(() => {
                                return locations.length > 0 ? (
                                    locations.map((loc) => (
                                        <DraggableLocationCard key={loc.id} loc={loc} />
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                                        Không tìm thấy địa điểm phù hợp.
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                </main>
                <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                    {activeDragLoc ? (
                        <div className="w-[300px] opacity-90 scale-105 shadow-2xl rotate-2">
                            <DraggableLocationCard loc={activeDragLoc} />
                        </div>
                    ) : null}
                </DragOverlay>
                {isMapModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950/70 p-4 backdrop-blur-sm">
                        <div className="relative h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
                            {/* Nút đóng */}
                            <button
                                onClick={() => setIsMapModalOpen(false)}
                                className="absolute right-4 top-4 z-10 rounded-full bg-white p-2.5 text-gray-500 shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="absolute left-4 top-4 z-10 rounded-xl bg-white/90 px-4 py-2 shadow-md backdrop-blur-md dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700">
                                <p className="text-sm font-bold text-brand-600 dark:text-brand-400">📍 Kéo thả hoặc click chọn vị trí</p>
                            </div>

                            <div className="h-full w-full">
                                <MapPicker
                                    onLocationSelect={async (lat: string, lng: string) => {
                                        const toastId = toast.loading("Đang phân tích địa chỉ...");

                                        try {
                                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
                                            const data = await response.json();
                                            const locationName = data.name || data.display_name || "Địa điểm tùy chỉnh";
                                            if (currentActiveDayId && currentActiveLocId) {
                                                handleUpdateActivity(currentActiveDayId, currentActiveLocId, 'location_name', locationName);
                                                handleUpdateActivity(currentActiveDayId, currentActiveLocId, 'lat', lat);
                                                handleUpdateActivity(currentActiveDayId, currentActiveLocId, 'lng', lng);

                                                toast.success(`Đã chọn: ${locationName}`, { id: toastId });
                                            } else {
                                                toast.dismiss(toastId);
                                            }
                                        } catch (error) {
                                            console.error("Lỗi lấy địa chỉ:", error);
                                            toast.error("Không lấy được tên, vui lòng tự nhập tay!", { id: toastId });
                                            if (currentActiveDayId && currentActiveLocId) {
                                                handleUpdateActivity(currentActiveDayId, currentActiveLocId, 'location_name', `${lat}, ${lng}`);
                                            }
                                        } finally {
                                            setIsMapModalOpen(false);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </DndContext>
        </div>
    )
}