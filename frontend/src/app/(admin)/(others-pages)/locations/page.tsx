"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { supabase } from "@/utils/supabaseClient";
import { AddLocationModal } from "@/components/modals/addLocation";
import toast, { Toaster } from "react-hot-toast";
import { Edit, Trash2, Eye, Plus, MapPin } from "lucide-react";

// --- IMPORT CỦA ANTD ---
import { Popconfirm } from "antd";

interface Location {
  id: string;
  name: string;
  description?: string;
  note?: string;
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
  const [isSaving, setIsSaving] = useState(false);
  const [mapLink, setMapLink] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    note: "",
    lat: "",
    lng: "",
    province_id: "",
    difficulty_level: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);

  const handleExtractFromLink = () => {
    if (!mapLink) {
      toast.error("Vui lòng nhập link Google Maps!");
      return;
    }
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = mapLink.match(regex);
    if (match) {
      setFormData((prev) => ({ ...prev, lat: match[1], lng: match[2] }));
      toast.success("Trích xuất tọa độ thành công!");
    } else {
      toast.error("Link không hợp lệ. Vui lòng copy từ thanh địa chỉ.");
    }
  };

  const executeDelete = async (id: string, name: string) => {
    const toastId = toast.loading(`Đang xóa "${name}"...`);

    try {
      const response = await fetch(`http://localhost:8000/locations/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Lỗi khi xóa");

      toast.success(`Đã xóa "${name}" thành công!`, { id: toastId });
      sessionStorage.removeItem("locations_cache");
      fetchLocations();
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Xóa thất bại! Vui lòng thử lại.", { id: toastId });
    }
  };

  const fetchProvinces = async () => {
    const cachedData = sessionStorage.getItem("provinces_cache");
    if (cachedData) {
      setProvinces(JSON.parse(cachedData));
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/provinces");
      const result = await response.json();
      let finalData = [];
      if (Array.isArray(result)) finalData = result;
      else if (result.data && Array.isArray(result.data)) finalData = result.data;
      else if (result.data?.data && Array.isArray(result.data.data)) finalData = result.data.data;
      else if (result.success && result.data) finalData = [result.data];

      setProvinces(finalData);
      sessionStorage.setItem("provinces_cache", JSON.stringify(finalData));
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    }
  };

  const fetchLocations = async () => {
    const cachedData = sessionStorage.getItem("locations_cache");
    if (cachedData) {
      setLocations(JSON.parse(cachedData));
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/locations");
      const result = await response.json();
      let finalData = [];
      if (Array.isArray(result)) finalData = result;
      else if (result.data && Array.isArray(result.data)) finalData = result.data;
      else if (result.data?.data && Array.isArray(result.data.data)) finalData = result.data.data;
      else if (result.success && result.data) finalData = [result.data];

      setLocations(finalData);
      sessionStorage.setItem("locations_cache", JSON.stringify(finalData));
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      toast.error("Không thể tải danh sách địa điểm!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();

    const locationChannel = supabase.channel("custom-location-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "locations" }, () => {
        sessionStorage.removeItem("locations_cache");
        fetchLocations();
      }).subscribe();

    const provinceChannel = supabase.channel("custom-province-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "provinces" }, () => {
        sessionStorage.removeItem("provinces_cache");
        fetchProvinces();
      }).subscribe();

    return () => {
      supabase.removeChannel(locationChannel);
      supabase.removeChannel(provinceChannel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("Đang lưu địa điểm lên hệ thống...");

    const submitData = new FormData();
    submitData.append("name", formData.name);
    if (formData.description) submitData.append("description", formData.description);
    if (formData.note) submitData.append("note", formData.note);
    if (formData.lat) submitData.append("lat", formData.lat);
    if (formData.lng) submitData.append("lng", formData.lng);
    if (formData.province_id) submitData.append("province_id", formData.province_id);
    if (formData.difficulty_level) submitData.append("difficulty_level", formData.difficulty_level);
    if (imageFile) submitData.append("image", imageFile);

    try {
      const response = await fetch("http://localhost:8000/locations", {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) throw new Error("Lỗi khi thêm địa điểm");

      toast.success("Thêm địa điểm thành công!", { id: toastId });

      setIsAddModalOpen(false);
      setFormData({ name: "", description: "", note: "", lat: "", lng: "", province_id: "", difficulty_level: "" });
      setImageFile(null);
      setMapLink("");

      sessionStorage.removeItem("locations_cache");
      fetchLocations();
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Lưu thất bại! Hãy kiểm tra lại kết nối.", { id: toastId });
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
    await fetchProvinces();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý Địa điểm" />
      <Toaster position="top-right" reverseOrder={false} />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
              Danh sách địa điểm
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Quản lý các địa điểm phượt và tọa độ trên bản đồ
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-500/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm địa điểm
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Hình ảnh</th>
                <th className="px-6 py-4 font-semibold">Tên địa điểm</th>
                <th className="px-6 py-4 font-semibold">Tỉnh thành</th>
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
              ) : !Array.isArray(locations) || locations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    Chưa có địa điểm nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr
                    key={loc.id}
                    className="bg-white transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-3">
                      {loc.img ? (
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
                          title="Xem chi tiết"
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Chỉnh sửa"
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
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <AddLocationModal
          setIsAddModalOpen={setIsAddModalOpen}
          formData={formData}
          setFormData={setFormData}
          mapLink={mapLink}
          setMapLink={setMapLink}
          setImageFile={setImageFile}
          handleInputChange={handleInputChange}
          handleExtractFromLink={handleExtractFromLink}
          handleAddSubmit={handleAddSubmit}
          provinces={provinces}
          isSaving={isSaving}
        />
      )}

    </div>
  );
}