import React from "react";
import { Edit, Trash2, Compass } from "lucide-react";
import { Province } from "@/interface";
import { Popconfirm } from "antd";
import { motion } from "framer-motion";

interface ProvinceTableProps {
    provinces: Province[];
    executeDelete: (id: string, name: string) => Promise<void>;
    setIsEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPickProvince: React.Dispatch<React.SetStateAction<Province | undefined>>;
}

export const ProvinceTable: React.FC<ProvinceTableProps> = ({
    provinces,
    executeDelete,
    setIsEditModalOpen,
    setPickProvince,
}) => {
    return (
        <>
            {provinces.map((loc, index) => (
                <motion.tr
                    key={loc.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                    className="group border-b border-transparent bg-white transition-all duration-300 hover:border-gray-100 hover:bg-gray-50/50 dark:bg-transparent dark:hover:border-gray-800 dark:hover:bg-gray-800/30"
                >
                    <td className="px-6 py-4">
                        <div className="relative h-14 w-24 overflow-hidden rounded-xl border border-gray-200/60 shadow-sm dark:border-gray-700">
                            {loc.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={loc.image_url}
                                    alt={loc.name}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-50/50 text-gray-300 dark:bg-gray-900/50 dark:text-gray-600">
                                    <Compass className="h-5 w-5 opacity-60" />
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 dark:ring-white/10 pointer-events-none"></div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                                {loc.name}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                            <span className="inline-flex items-center rounded-lg border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-xs font-bold text-blue-700 backdrop-blur-md dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-400">
                                {loc.height ? `${loc.height} m` : "Chưa cập nhật"}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-60 transition-all duration-300 group-hover:opacity-100">
                            <button
                                title="Chỉnh sửa"
                                onClick={() => {
                                    setPickProvince(loc);
                                    setIsEditModalOpen(true);
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-blue-500 transition-all hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-500/30 active:scale-90 dark:bg-gray-800/80 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <Popconfirm
                                title={<span className="font-bold">Xác nhận xóa tỉnh/thành</span>}
                                description={
                                    <div className="max-w-[250px] text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Bạn có chắc chắn muốn xóa vĩnh viễn <strong>&quot;{loc.name}&quot;</strong>? Hành động này sẽ không thể đảo ngược.
                                    </div>
                                }
                                onConfirm={() => executeDelete(loc.id, loc.name)}
                                okText="Xóa vĩnh viễn"
                                cancelText="Hủy bỏ"
                                okButtonProps={{ danger: true, className: "font-semibold" }}
                                cancelButtonProps={{ className: "font-semibold" }}
                                placement="topRight"
                            >
                                <button
                                    title="Gỡ bỏ địa điểm"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-red-500 transition-all hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 active:scale-90 dark:bg-gray-800/80 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </Popconfirm>
                        </div>
                    </td>
                </motion.tr>
            ))}
        </>
    );
};