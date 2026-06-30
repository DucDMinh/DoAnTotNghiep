import { Edit, Trash2, Eye } from "lucide-react";
import { Location } from "@/interface"
import { Popconfirm } from "antd";
interface LocationTableProps {
    locations: Location[],
    executeDelete: (id: string, name: string) => Promise<void>,
    setIsEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPickLocation: React.Dispatch<React.SetStateAction<Location | undefined>>;
    setFormData: React.Dispatch<
        React.SetStateAction<{
            name: string;
            description: string;
            note: string;
            lat: string;
            lng: string;
            province_id: string;
            difficulty_level: string;
        }>
    >;
}

export const LocationTable: React.FC<LocationTableProps> = ({
    locations,
    executeDelete,
    setIsEditModalOpen,
    setPickLocation,
    setFormData
}) => {
    return (
        locations.map((loc) => (
            <tr
                key={loc.id}
                className="bg-white transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50"
            >
                <td className="px-6 py-3">
                    {loc.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={loc.img} alt={loc.name} className="h-12 w-12 rounded-lg object-cover shadow-sm" />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-800">
                            Trống
                        </div>
                    )}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {loc.name}
                </td>
                <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {loc.provinces?.name || "Chưa cập nhật"}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button
                            title="Chỉnh sửa"
                            onClick={() => {
                                setPickLocation(loc);
                                setFormData({
                                    name: loc.name || "",
                                    description: loc.description || "",
                                    note: loc.note || "",
                                    lat: loc.lat?.toString() || "",
                                    lng: loc.lng?.toString() || "",
                                    province_id: loc.province_id || "",
                                    difficulty_level: loc.difficulty_level || ""
                                });
                                setIsEditModalOpen(true);
                            }}
                            className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <Popconfirm
                            title="Xác nhận xóa địa điểm"
                            description={
                                <div className="max-w-[250px]">
                                    Bạn có chắc chắn muốn xóa <strong>&quot;{loc.name}&quot;</strong>? Hành động này không thể hoàn tác.
                                </div>
                            }
                            onConfirm={() => executeDelete(loc.id, loc.name)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                            placement="topRight"
                        >
                            <button
                                title="Xóa địa điểm"
                                className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </Popconfirm>

                    </div>
                </td>
            </tr>
        ))
    )
}