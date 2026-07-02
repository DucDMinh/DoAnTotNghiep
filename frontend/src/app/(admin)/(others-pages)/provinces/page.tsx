"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { supabase } from "@/utils/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { Plus, MapPin } from "lucide-react";
import { Province } from "@/interface";
import { ProvinceTable } from "@/components/tables/provinceTable";


export default function ProvincesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [pickProvince, setPickProvince] = useState<Province | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterProvince, setFilterProvince] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        best_time_to_visit: "",
        height: "",
        locations: "",
        image_url: "",
    });


    const executeDelete = async (id: string, name: string) => {
        const toastId = toast.loading(`Đang xóa "${name}"...`);

        try {
            const response = await fetch(`http://localhost:8000/provinces/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Lỗi khi xóa");

            toast.success(`Đã xóa "${name}" thành công!`, { id: toastId });
            sessionStorage.removeItem("locations_cache");
            fetchProvinces();
        } catch (error) {
            console.error("Lỗi:", error);
            toast.error("Xóa thất bại! Vui lòng thử lại.", { id: toastId });
        }
    };

    const fetchProvinces = async () => {
        setIsLoading(true);
        try {
            // 🛠️ SỬA: Gọi API gốc, không đính kèm bất kỳ params phân trang nào nữa
            const response = await fetch(`http://localhost:8000/provinces`);
            const result = await response.json();

            if (result.success && result.data) {
                setProvinces(result.data);
                // Đã xóa setTotalPages ở đây vì không cần thiết nữa
            } else if (Array.isArray(result)) {
                setProvinces(result);
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error);
            toast.error("Không thể tải danh sách địa điểm!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Dùng setTimeout 0 để ép React đưa hàm fetch vào luồng bất đồng bộ, tránh cảnh báo
        const initTimer = setTimeout(() => {
            fetchProvinces();
        }, 0);

        const provinceChannel = supabase.channel("custom-province-channel")
            .on("postgres_changes", { event: "*", schema: "public", table: "provinces" }, () => {
                sessionStorage.removeItem("provinces_cache");
                fetchProvinces();
            }).subscribe();

        return () => {
            supabase.removeChannel(provinceChannel);
            clearTimeout(initTimer);
        };
        // 🛠️ SỬA QUAN TRỌNG: Chỉ để mảng rỗng [] ở đây
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading("Đang lưu địa điểm lên hệ thống...");

        const submitData = new FormData();
        submitData.append("name", formData.name);
        if (formData.description) submitData.append("description", formData.description);
        if (formData.best_time_to_visit) submitData.append("best_time_to_visit", formData.best_time_to_visit);
        if (formData.height) submitData.append("height", formData.height);
        if (formData.locations) submitData.append("locations", formData.locations);
        if (imageFile) submitData.append("image", imageFile);

        try {
            const response = await fetch("http://localhost:8000/provinces", {
                method: "POST",
                body: submitData,
            });

            if (!response.ok) throw new Error("Lỗi khi thêm địa điểm");

            toast.success("Thêm địa điểm thành công!", { id: toastId });

            setIsAddModalOpen(false);
            setFormData({ name: "", description: "", best_time_to_visit: "", height: "", locations: "", image_url: "" });
            setImageFile(null);

            sessionStorage.removeItem("locations_cache");
            fetchProvinces();
        } catch (error) {
            console.error("Lỗi:", error);
            toast.error("Lưu thất bại! Hãy kiểm tra lại kết nối.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pickProvince) {
            toast.error("Không tìm thấy dữ liệu địa điểm cần sửa!");
            return;
        }
        setIsSaving(true);
        const toastId = toast.loading("Đang cập nhật địa điểm...");

        const submitData = new FormData();
        submitData.append("name", formData.name);
        if (formData.description) submitData.append("description", formData.description);
        if (formData.best_time_to_visit) submitData.append("best_time_to_visit", formData.best_time_to_visit);
        if (formData.height) submitData.append("height", formData.height);
        if (formData.locations) submitData.append("locations", formData.locations);
        if (imageFile) {
            submitData.append("image", imageFile);
        }
        // MẸO: Nếu API của bạn cần cờ báo xóa ảnh cũ (khi người dùng bấm X xóa ảnh mà không tải ảnh mới)
        // else if (!oldImageUrl && pickProvince.img) {
        //     submitData.append("delete_old_image", "true"); 
        // }

        try {
            const response = await fetch(`http://localhost:8000/locations/${pickProvince.id}`, {
                method: "PUT",
                body: submitData,
            });

            if (!response.ok) throw new Error("Lỗi khi cập nhật địa điểm");

            toast.success("Cập nhật địa điểm thành công!", { id: toastId });

            setIsEditModalOpen(false);
            setPickProvince(undefined);
            setFormData({ name: "", description: "", best_time_to_visit: "", height: "", locations: "", image_url: "" });
            setImageFile(null);
            sessionStorage.removeItem("provinces_cache");
            fetchProvinces();

        } catch (error) {
            console.error("Lỗi:", error);
            toast.error("Cập nhật thất bại! Hãy kiểm tra lại kết nối.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = async () => {
        setIsAddModalOpen(true);
    };

    const ITEMS_PER_PAGE = 10;

    // 1. Tìm kiếm nội bộ
    const filteredProvinces = provinces.filter((province) => {
        if (!searchQuery) return true;
        return province.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // 2. Tính tổng số trang nội bộ
    const calculatedTotalPages = Math.ceil(filteredProvinces.length / ITEMS_PER_PAGE) || 1;

    // 3. Cắt 10 tỉnh ra để hiển thị cho trang hiện tại
    const paginatedProvinces = filteredProvinces.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <PageBreadcrumb pageTitle="Quản lý Tỉnh/Thành phố" />
            <Toaster position="top-right" reverseOrder={false} />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                            Danh sách tỉnh/thành phố
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Quản lý các tỉnh/thành phố trong hệ thống
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-500/30"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm tỉnh/thành phố
                    </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                            {/* Ô tìm kiếm */}
                            <input
                                type="text"
                                placeholder="Tìm tên địa điểm..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:w-64 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Hình ảnh</th>
                                <th className="px-6 py-4 font-semibold">Tên Tỉnh thành</th>
                                <th className="px-6 py-4 font-semibold">Độ cao </th>
                                <th className="px-6 py-4 text-right font-semibold">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="mb-2 h-6 w-6 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            ) : !Array.isArray(provinces) || provinces.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                                        Chưa có địa điểm nào trong hệ thống.
                                    </td>
                                </tr>
                            ) : (
                                <ProvinceTable
                                    provinces={paginatedProvinces}
                                    executeDelete={executeDelete}
                                    setIsEditModalOpen={setIsEditModalOpen}
                                    setPickProvince={setPickProvince}
                                    setFormData={setFormData}
                                />
                            )}
                        </tbody>
                    </table>
                    {/* 🛠️ SỬA: Dùng !isLoading && calculatedTotalPages > 1 */}
                    {!isLoading && calculatedTotalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900 rounded-b-xl">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {/* 🛠️ SỬA: Hiển thị đúng số trang tính toán */}
                                Trang {currentPage} trên {calculatedTotalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Trước
                                </button>
                                <button
                                    // 🛠️ SỬA: Dùng calculatedTotalPages thay cho totalPages
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, calculatedTotalPages))}
                                    disabled={currentPage === calculatedTotalPages}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isAddModalOpen && (<div></div>
            )}

            {isEditModalOpen && (
                <div></div>
            )}

        </div>
    );
}