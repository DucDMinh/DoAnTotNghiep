import { X } from "lucide-react";
import { useState } from "react";
import { BuilderScreenProp } from "@/interface";
import React from "react";
import { DndContext, DragOverlay } from '@dnd-kit/core';
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { Compass } from "lucide-react";
import { useItineraryBuilder } from "@/hooks/Itineraries/useItineraryBuilder";
import { BuilderHeader } from "./BuilderHeader";
import { GeneralInfoForm } from "./GeneralInfoForm";
import { DayCard } from "./DayCard";
import { LocationSidebar } from "./LocationSidebar";
import { DraggableLocationCard } from "./DraggableLocationCard";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-900 text-sm text-gray-400">
            <Compass className="h-8 w-8 animate-spin text-brand-400 mb-3" />
            <span className="font-medium tracking-wider text-xs uppercase text-gray-400">Đang tải bản đồ...</span>
        </div>
    ),
});


export const BuilderScreen: React.FC<BuilderScreenProp> = (props) => {
    const { setStep,
        selectedProvinces,
        currentItinerary,
        setCurrentItinerary,
        locations,
        setSelectedProvinces } = props;
    const {
        days,
        calculateTotalCost,
        activeDragLoc,
        isMapModalOpen,
        handleDragStart,
        handleDragEnd,
        setIsMapModalOpen,
        handleUpdateActivity,
        handleAddItinerary,
        handleAddActivity,
        handleRemoveActivity } = useItineraryBuilder(props);

    const [currentActiveDayId, setCurrentActiveDayId] = useState<string | null>(null);
    const [currentActiveLocId, setCurrentActiveLocId] = useState<string | null>(null);

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
                        <div className="mt-6">
                            <DayCard
                                days={days}
                                handleAddActivity={handleAddActivity}
                                handleRemoveActivity={handleRemoveActivity}
                                handleUpdateActivity={handleUpdateActivity}
                                setIsMapModalOpen={setIsMapModalOpen}
                                setCurrentActiveDayId={setCurrentActiveDayId}
                                setCurrentActiveLocId={setCurrentActiveLocId}
                            />
                        </div>
                    </div>

                    <LocationSidebar
                        selectedProvinces={selectedProvinces}
                        locations={locations}
                    />

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