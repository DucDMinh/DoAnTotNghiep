"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { supabase } from "@/utils/supabaseClient";

interface Location {
    id: string;
    name: string;
    description?: string;
    province_id?: string;
    provinces?: {
        name: string;
    };
    lat: number;
    lng: number;
    img: string | null;
    difficulty_level?: string;
    rating?: number;
    created_at?: string;
}

export default function LocationsPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const fetchLocations = async () => {
        const cachedData = sessionStorage.getItem("locations_cache");

        if (cachedData) {
            console.log("Đã lấy dữ liệu từ Cache (không gọi API)");
            setLocations(JSON.parse(cachedData));
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch("http://localhost:8000/locations");
            const result = await response.json();
            let finalData = [];
            if (Array.isArray(result)) {
                finalData = result;
            } else if (result.data && Array.isArray(result.data)) {
                finalData = result.data;
            } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
                finalData = result.data.data;
            } else if (result.success && result.data) {
                finalData = [result.data];
            }
            setLocations(finalData);

            sessionStorage.setItem("locations_cache", JSON.stringify(finalData));

        } catch (error) {
            console.error("Lỗi kết nối đến máy chủ:", error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchLocations();

        const locationChannel = supabase
            .channel('custom-all-channel')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'locations'
                },
                (payload) => {
                    console.log('Phát hiện thay đổi từ Database:', payload);
                    sessionStorage.removeItem("locations_cache");
                    fetchLocations();
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(locationChannel);
        };
    }, []);

    useEffect(() => {
        console.log("Dữ liệu địa điểm đã được cập nhật:", locations);
    }, [locations]);

    const deleteLocation = async (id: string, name: string) => {
        if (confirm(`Bạn có chắc chắn muốn xóa địa điểm "${name}" không?`)) {
            fetch(`http://localhost:8000/locations/${id}`, {
                method: "DELETE",
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Lỗi khi xóa địa điểm");
                    }
                    sessionStorage.removeItem("locations_cache");
                    fetchLocations();
                })
                .catch((error) => {
                    console.error("Lỗi:", error);
                    alert("Đã xảy ra lỗi khi xóa địa điểm.");
                });
        }
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Quản lý Địa điểm" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Danh sách địa điểm
                    </h3>
                    <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
                        + Thêm địa điểm
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Hình ảnh</th>
                                <th className="px-6 py-3">Tên địa điểm</th>
                                <th className="px-6 py-3">Tỉnh thành</th>
                                <th className="px-6 py-3 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : !Array.isArray(locations) || locations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                                        Chưa có địa điểm nào trong cơ sở dữ liệu (hoặc API lỗi).
                                    </td>
                                </tr>
                            ) : (
                                locations.map((loc) => (
                                    <tr
                                        key={loc.id}
                                        className="border-b bg-white dark:border-gray-700 dark:bg-gray-900"
                                    >
                                        <td className="px-6 py-4">
                                            {loc.img ? (
                                                <img
                                                    src={loc.img}
                                                    alt={loc.name}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                                    No Image
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {loc.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {loc.provinces?.name || "Chưa cập nhật"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="font-medium text-blue-600 hover:underline mr-3">
                                                Sửa
                                            </button>
                                            <button className="font-medium text-red-600 hover:underline" onClick={() => deleteLocation(loc.id, loc.name)}>
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}