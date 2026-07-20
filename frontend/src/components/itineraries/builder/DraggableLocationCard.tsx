import { useDraggable } from "@dnd-kit/core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DraggableLocationCard = ({ loc }: { loc: any }) => {
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