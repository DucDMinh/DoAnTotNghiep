import {
    Save, Calendar, DollarSign, MapPin,
    Plus, Trash2, Search, Filter, Map,
    ArrowLeft, CheckCircle2, X
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BuilderScreenProp, Itinerary_days, Itinerary_locations } from "@/interface";
import React from "react";
import { DndContext, DragEndEvent, DragStartEvent, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { Compass } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import Switch from '@mui/material/Switch';

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any

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
export const BuilderScreen: React.FC<BuilderScreenProp> = ({ setStep, selectedProvinces, currentItinerary, setCurrentItinerary, locations }) => {
    const [days, setDays] = useState<Itinerary_days[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [activeDragLoc, setActiveDragLoc] = useState<any>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [currentActiveDayId, setCurrentActiveDayId] = useState<string | null>(null);
    const [currentActiveLocId, setCurrentActiveLocId] = useState<string | null>(null);
    const isDataLoaded = React.useRef(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DroppableActivityZone = ({ dayId, loc, onUpdate }: { dayId: string, loc: any, onUpdate: any }) => {
        const { isOver, setNodeRef } = useDroppable({
            id: `drop-activity-${dayId}-${loc.id}`,
            data: { type: 'existing-activity', dayId, activityId: loc.id }
        });

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
                    placeholder={isOver ? "✨ Thả địa điểm vào đây..." : "Gõ tên, kéo thả, hoặc chọn Map..."}
                    value={loc.location_name || ''}
                    onChange={(e) => {
                        onUpdate(dayId, loc.id, 'location_name', e.target.value);
                        if (loc.location_id) {
                            onUpdate(dayId, loc.id, 'location_id', "");
                        }
                    }}
                    className={`flex-1 min-w-0 bg-transparent px-3 text-sm font-medium outline-none placeholder:text-gray-400 dark:text-white ${isOver ? 'text-brand-600' : ''}`}
                />
                <div className="flex h-full items-center shrink-0">
                    {loc.location_id ? (
                        <div className="flex h-full items-center px-3 border-l border-gray-100 dark:border-gray-700 bg-green-50 dark:bg-green-900/20 text-green-600" title="Địa điểm chuẩn từ hệ thống">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                setIsMapModalOpen(true);
                                setCurrentActiveDayId(dayId);
                                setCurrentActiveLocId(loc.id);
                            }}
                            className="flex h-full items-center justify-center gap-1.5 border-l border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-brand-400"
                        >
                            <Map className="h-4 w-4" /> Bản đồ
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const calculateTotalCost = () => {
        return days.reduce((total, day) => {
            const dayCost = day.itinerary_locations?.reduce((sum, loc) => sum + (Number(loc.cost) || 0), 0) || 0;
            return total + dayCost;
        }, 0);
    };
    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    React.useEffect(() => {
        if (currentItinerary) console.log(currentItinerary)
        if (currentItinerary?.itinerary_days && !isDataLoaded.current) {

            // 🛠️ BƯỚC MAPPING: Chuyển đổi dữ liệu API cho khớp với Giao diện
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formattedDays = currentItinerary.itinerary_days.map((day: any) => {
                const rawLocations = day.itinerary_locations || [];

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const formattedLocations = rawLocations.map((loc: any) => {
                    // Nếu loc.locations tồn tại, nghĩa là nó là dữ liệu lồng nhau từ API
                    if (loc.locations) {
                        return {
                            ...loc,
                            // Kéo dữ liệu từ Object con (locations) ra ngoài thành thuộc tính ngang hàng
                            location_id: loc.locations.id,
                            location_name: loc.locations.name,
                            lat: loc.locations.lat || 0, // Cứ dự phòng 0 nếu API thiếu
                            lng: loc.locations.lng || 0
                        };
                    }

                    // Nếu nó đã có sẵn location_name (trường hợp tự tạo mới từ giao diện) thì giữ nguyên
                    return loc;
                });

                return {
                    ...day,
                    itinerary_locations: formattedLocations
                };
            });

            setTimeout(() => {
                setDays(formattedDays); // Ép vào State cái mảng đã được Mapping
            }, 0);

            isDataLoaded.current = true;
            return;
        }
        if (currentItinerary?.start_date && currentItinerary.end_date) {
            const start = new Date(currentItinerary.start_date);
            const end = new Date(currentItinerary.end_date);

            if (end >= start) {
                const diffTime = end.getTime() - start.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                setTimeout(() => {
                    setDays(prevDays => {
                        const newDays = [...prevDays];
                        // Nếu user kéo dài ngày -> thêm ngày mới
                        if (newDays.length < diffDays) {
                            for (let i = newDays.length + 1; i <= diffDays; i++) {
                                newDays.push({
                                    id: uuidv4(),
                                    day_number: i,
                                    title: `Ngày ${i}`,
                                    itinerary_locations: [] // Lưu ý đổi thành itinerary_locations nếu db của bạn dùng tên này
                                });
                            }
                            return newDays;
                        }
                        // Nếu user rút ngắn ngày -> cắt bỏ ngày thừa
                        else if (newDays.length > diffDays) {
                            return newDays.slice(0, diffDays);
                        }
                        return prevDays;
                    });
                }, 0);
            }
        }
    }, [currentItinerary?.start_date, currentItinerary?.end_date, currentItinerary?.itinerary_days]);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpdateActivity = (dayId: string, activityId: string, field: string, value: any) => {
        setDays(prevDays => prevDays.map(day => {
            if (day.id === dayId) {
                return {
                    ...day,
                    itinerary_locations: day.itinerary_locations.map((loc: Itinerary_locations) => {
                        if (loc.id === activityId) {
                            return { ...loc, [field]: value };
                        }
                        return loc;
                    })
                };
            }
            return day;
        }));
    };
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveDragLoc(active.data.current?.location);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragLoc(null);
        const { active, over } = event;

        if (!over) return;

        const draggedLocation = active.data.current?.location;
        const dropData = over.data.current;

        if (dropData?.type === 'existing-activity') {
            handleUpdateActivity(dropData.dayId, dropData.activityId, 'location_id', draggedLocation.id);
            handleUpdateActivity(dropData.dayId, dropData.activityId, 'location_name', draggedLocation.name);
            handleUpdateActivity(dropData.dayId, dropData.activityId, 'lat', draggedLocation.lat);
            handleUpdateActivity(dropData.dayId, dropData.activityId, 'lng', draggedLocation.lng);
            toast.success(`Đã thêm địa điểm ${draggedLocation.name}`);
        } else if (dropData?.type === 'new-activity') {
            setDays(prevDays => prevDays.map(day => {
                if (day.id === dropData.dayId) {
                    const newActivity: Itinerary_locations = {
                        id: uuidv4(),
                        day_id: day.id,
                        location_id: draggedLocation.id,
                        location_name: draggedLocation.name,
                        start_time: "08:00",
                        end_time: "10:00",
                        cost: 0,
                        sequence_order: (day.itinerary_locations?.length || 0) + 1,
                        activity_note: "",
                        lat: draggedLocation.lat,
                        lng: draggedLocation.lng
                    };

                    return { ...day, itinerary_locations: [...(day.itinerary_locations || []), newActivity] };
                }
                return day;
            }));
            toast.success(`Đã tạo hoạt động tại ${draggedLocation.name}`);
        }
    };

    useEffect(() => {
        console.log(currentItinerary)
    }, [currentItinerary])

    const handleAddItinerary = async () => {
        const submitData = new FormData();
        if (currentItinerary?.title) submitData.append('title', currentItinerary.title);
        if (currentItinerary?.theme) submitData.append('theme', currentItinerary.theme);
        if (currentItinerary?.summary) submitData.append('summary', currentItinerary.summary);
        if (currentItinerary?.start_date) submitData.append('start_date', currentItinerary.start_date);
        if (currentItinerary?.nights) submitData.append('nights', String(currentItinerary.nights));
        if (currentItinerary?.days) submitData.append('days', String(currentItinerary.days));
        if (currentItinerary?.image_url) submitData.append('image_url', currentItinerary.image_url);
        submitData.append('estimated_cost', String(calculateTotalCost()));
        if (currentItinerary?.end_date) submitData.append('end_date', currentItinerary.end_date);
        submitData.append('share', String(currentItinerary?.share ?? false));
        if (days && days.length > 0) {
            submitData.append('itinerary_days', JSON.stringify(days));
        }

        const toastId = toast.loading("Đang lưu lộ trình...");
        try {
            console.log("submitData", Object.fromEntries(submitData.entries()));
            const response = await fetch("http://localhost:8000/itineraries", {
                method: "POST",
                body: submitData
            });

            if (!response.ok) throw new Error("Lỗi khi thêm địa điểm");

            toast.success("Lưu lộ trình thành công!", { id: toastId });

            setStep("SETUP");

        } catch (error) {
            console.error("Lỗi:", error);
            toast.error("Có lỗi xảy ra khi lưu!", { id: toastId });
        }
    }
    const label = { slotProps: { input: { 'aria-label': 'Switch demo' } } };
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-950 font-sans animate-in fade-in zoom-in-95 duration-300">
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
                <div className="flex items-center gap-4">
                    <button onClick={() => setStep("SETUP")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500" title="Quay lại">
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
                    <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-green-700 dark:bg-green-900/20 dark:text-green-400 hidden sm:flex">
                        <DollarSign className="h-5 w-5" />
                        <div>
                            <p className="text-xs font-semibold uppercase opacity-70">Tổng dự kiến</p>
                            <p className="text-lg font-bold leading-none">{calculateTotalCost().toLocaleString('vi-VN')} đ</p>
                        </div>
                    </div>
                    <button
                        onClick={() =>
                            handleAddItinerary()
                        }
                        className="flex items-center rounded-xl bg-brand-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-700 active:scale-95">
                        <Save className="mr-2 h-4 w-4" /> Lưu
                    </button>
                </div>
            </header>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-0 overflow-hidden h-[calc(100vh-80px)]">

                    <div className="col-span-1 xl:col-span-8 overflow-y-auto p-6 lg:p-8 custom-scrollbar pb-32">
                        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-center justify-between gap-4">
                                <input
                                    type="text"
                                    value={currentItinerary?.title || ''}
                                    onChange={(e) => setCurrentItinerary({ ...currentItinerary, title: e.target.value })}
                                    placeholder="Nhập tên lộ trình"
                                    className="flex-1 w-full border-none bg-transparent text-3xl font-black text-gray-900 focus:outline-none focus:ring-0 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                />
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        {currentItinerary?.share ? 'Công khai' : 'Riêng tư'}
                                    </span>
                                    <Switch checked={currentItinerary?.share ?? false}
                                        onChange={() => setCurrentItinerary({
                                            ...currentItinerary,
                                            share: !currentItinerary?.share
                                        })}>
                                    </Switch>
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Ngày khởi hành
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none z-10" />

                                        <input
                                            type="date"
                                            min={today}
                                            value={currentItinerary?.start_date || ''}
                                            onChange={(e) => setCurrentItinerary({ ...currentItinerary, start_date: e.target.value })}
                                            onClick={(e) => {
                                                if ('showPicker' in HTMLInputElement.prototype) {
                                                    e.currentTarget.showPicker();
                                                }
                                            }}

                                            className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white [color-scheme:light_dark]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Ngày kết thúc
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none z-10" />

                                        <input
                                            type="date"
                                            value={currentItinerary?.end_date || ''}
                                            onChange={(e) => setCurrentItinerary({ ...currentItinerary, end_date: e.target.value })}
                                            min={currentItinerary?.start_date || today}
                                            onClick={(e) => {
                                                if ('showPicker' in HTMLInputElement.prototype) {
                                                    e.currentTarget.showPicker();
                                                }
                                            }}

                                            className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white [color-scheme:light_dark]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        <MapPin className="mr-2 h-4 w-4" /> Chủ đề
                                    </label>
                                    <select value={currentItinerary?.theme || ''} onChange={(e) => setCurrentItinerary({ ...currentItinerary, theme: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                        <option value="">Chọn chủ đề...</option>
                                        <option value="Trekking & Khám phá">Trekking & Khám phá</option>
                                        <option value="Nghỉ dưỡng">Nghỉ dưỡng</option>
                                        <option value="Văn hóa - Lịch sử">Văn hóa - Lịch sử</option>
                                        <option value="Ẩm thực">Ẩm thực</option>
                                    </select>
                                </div>
                            </div>
                        </div>

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