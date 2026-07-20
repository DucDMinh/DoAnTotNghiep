import { useDraggable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

export const DraggableLocationCard = ({
    loc,
    onAdd,
    isAdded,
    distance
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loc: any,
    onAdd?: () => void,
    isAdded?: boolean,
    distance?: number
}) => {
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
                } ${isAdded ? 'opacity-50 saturate-50' : 'opacity-100'}`}
        >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 pointer-events-none relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={loc.image_url || loc.img} alt={loc.name} className="h-full w-full object-cover" />
                {isAdded && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white uppercase text-center leading-tight">Đã<br />thêm</span>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 pointer-events-none">
                <h4 className={`truncate text-sm font-bold ${isAdded ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{loc.name}</h4>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <span className={`${isAdded ? 'text-gray-400' : 'text-green-500'} font-medium`}>
                        {loc.difficulty_level || loc.difficulty}
                    </span>
                    {distance !== undefined ? (
                        <>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-brand-500 font-medium">{distance.toFixed(1)} km</span>
                        </>
                    ) : (
                        <>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-gray-400 italic text-[11px]">Chưa có tọa độ</span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd?.();
                    }}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
                    title="Thêm lại vào lộ trình"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};