"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { supabase } from "@/utils/supabaseClient";
import { AddLocationModal } from "@/components/modals/addLocation";
import toast, { Toaster } from "react-hot-toast";
import { Plus, MapPin } from "lucide-react";
import { LocationTable } from "@/components/tables/locationsTable";
import type { Location } from "@/interface"
import { EditLocationModal } from "@/components/modals/editLocation";


export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mapLink, setMapLink] = useState("");
  const [pickLocation, setPickLocation] = useState<Location>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProvince, setFilterProvince] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleExtractFromLink = async () => {
    if (!mapLink) {
      toast.error("Vui lòng nhập link Google Maps!");
      return;
    }
    let cleanLink = mapLink.trim();
    if (cleanLink.includes("http://") && cleanLink.indexOf("http://") > 0) {
      cleanLink = "http://" + cleanLink.split("http://")[1];
    } else if (cleanLink.includes("https://") && cleanLink.indexOf("https://") > 0) {
      cleanLink = "https://" + cleanLink.split("https://")[1];
    }

    const toastId = toast.loading("Đang trích xuất tọa độ và hình ảnh...");

    try {
      const response = await fetch(`http://localhost:8000/extract-map?url=${encodeURIComponent(cleanLink)}`);
      if (!response.ok) throw new Error("API lỗi");

      const result = await response.json();
      const finalUrl = result.expandedUrl || mapLink;
      const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const match = finalUrl.match(regex);
      let extractedName = result.name || "";
      if (!extractedName && finalUrl.includes('/place/')) {
        const nameMatch = finalUrl.match(/\/place\/([^/]+)/);
        if (nameMatch) {
          extractedName = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
        }
      }
      if (match) {
        setFormData((prev) => ({
          ...prev,
          lat: match[1],
          lng: match[2],
          ...(extractedName ? { name: extractedName } : {})
        }));
      } else {
        toast.error("Không tìm thấy tọa độ trong link này.", { id: toastId });
        return;
      }
      if (match) {
        const lat = match[1];
        const lng = match[2];
        let matchedProvinceId = "";

        // --- BƯỚC 1: ƯU TIÊN TÌM TRONG TÊN (extractedName) TRƯỚC ---
        if (extractedName) {
          // Cắt chuỗi theo dấu phẩy và lấy cụm cuối cùng (Xóa khoảng trắng ở 2 đầu)
          const nameParts = extractedName.split(',');
          const lastPart = nameParts[nameParts.length - 1].trim();
          const normalizedLastPart = removeAccents(lastPart);

          const foundInName = provinces.find((p) => {
            // Dọn dẹp tên trong DB
            const dbNameClean = p.name.replace(/Tỉnh |Thành phố |TP\. /gi, '').trim();
            const normalizedDbName = removeAccents(dbNameClean);

            // CHỈ so sánh tên DB với cụm cuối cùng của Google Maps
            return normalizedLastPart.includes(normalizedDbName) || normalizedDbName.includes(normalizedLastPart);
          });

          if (foundInName) {
            matchedProvinceId = foundInName.id;
          }
        }

        // --- BƯỚC 2: NẾU BƯỚC 1 TRƯỢT, MỚI GỌI API BACKEND DỰA VÀO TỌA ĐỘ ---
        if (!matchedProvinceId) {
          try {
            const provRes = await fetch(`http://localhost:8000/get-province-from-coords?lat=${lat}&lng=${lng}`);
            const provData = await provRes.json();

            if (provData.provinceName) {
              const rawName = provData.provinceName;
              const normalizedRaw = removeAccents(rawName);

              const foundInCoords = provinces.find(p => {
                const dbNameClean = p.name.replace(/Tỉnh |Thành phố |TP\. /gi, '').trim();
                const normalizedDb = removeAccents(dbNameClean);
                return normalizedRaw.includes(normalizedDb) || normalizedDb.includes(normalizedRaw);
              });

              if (foundInCoords) {
                matchedProvinceId = foundInCoords.id;
              }
            }
          } catch (e) {
            console.error("Lỗi khi tra cứu tọa độ lấy tỉnh:", e);
            // Lỗi API thì vẫn tiếp tục, không làm gián đoạn
          }
        }

        // --- BƯỚC 3: CẬP NHẬT TẤT CẢ VÀO STATE ---
        setFormData((prev) => ({
          ...prev,
          lat,
          lng,
          ...(matchedProvinceId ? { province_id: matchedProvinceId } : {})
        }));

      } else {
        toast.error("Không tìm thấy tọa độ trong link này.", { id: toastId });
        return;
      }
      if (result.base64) {
        const file = base64ToFile(result.base64, result.fileName, result.mimeType);
        setImageFile(file);
        toast.success("Trích xuất tọa độ và ảnh thành công!", { id: toastId });
      } else {
        toast.success("Lấy tọa độ thành công (Không có ảnh xem trước)!", { id: toastId });
      }

    } catch (error) {
      console.error(error);
      const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const match = mapLink.match(regex);
      if (match) {
        setFormData((prev) => ({ ...prev, lat: match[1], lng: match[2] }));
        toast.success("Đã lấy được tọa độ (Chưa lấy được ảnh)!", { id: toastId });
      } else {
        toast.error("Không thể trích xuất dữ liệu từ link này.", { id: toastId });
      }
    }
  };
  const removeAccents = (str: string) => {
    return str
      .normalize("NFD") // Tách các dấu khỏi ký tự
      .replace(/[\u0300-\u036f]/g, "") // Xóa các ký tự dấu
      .toLowerCase() // Chuyển về chữ thường để so sánh không phân biệt hoa/thường
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
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
      setTimeout(() => {
        setProvinces(JSON.parse(cachedData));
      }, 0);
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
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "5",
        ...(searchQuery && { search: searchQuery }),
        ...(filterProvince && { province_id: filterProvince })
      });

      const response = await fetch(`http://localhost:8000/locations?${params}`);
      const result = await response.json();

      if (result.success && result.data) {
        setLocations(result.data);
        setTotalPages(result.totalPages || 1);
      } else if (Array.isArray(result)) {
        setLocations(result);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      toast.error("Không thể tải danh sách địa điểm!");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const initTimer = setTimeout(() => {
      fetchProvinces();
    }, 0);
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
      clearTimeout(initTimer);
      supabase.removeChannel(locationChannel);
      supabase.removeChannel(provinceChannel);
    };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLocations();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterProvince, searchQuery]);
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterProvince(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const base64ToFile = (base64String: string, fileName: string, mimeType: string): File => {
    const arr = base64String.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mimeType });
  };

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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickLocation) {
      toast.error("Không tìm thấy dữ liệu địa điểm cần sửa!");
      return;
    }
    setIsSaving(true);
    const toastId = toast.loading("Đang cập nhật địa điểm...");

    const submitData = new FormData();
    submitData.append("name", formData.name);
    if (formData.description) submitData.append("description", formData.description);
    if (formData.note) submitData.append("note", formData.note);
    if (formData.lat) submitData.append("lat", formData.lat);
    if (formData.lng) submitData.append("lng", formData.lng);
    if (formData.province_id) submitData.append("province_id", formData.province_id);
    if (formData.difficulty_level) submitData.append("difficulty_level", formData.difficulty_level);
    if (imageFile) {
      submitData.append("image", imageFile);
    }
    // MẸO: Nếu API của bạn cần cờ báo xóa ảnh cũ (khi người dùng bấm X xóa ảnh mà không tải ảnh mới)
    // else if (!oldImageUrl && pickLocation.img) {
    //     submitData.append("delete_old_image", "true"); 
    // }

    try {
      const response = await fetch(`http://localhost:8000/locations/${pickLocation.id}`, {
        method: "PUT",
        body: submitData,
      });

      if (!response.ok) throw new Error("Lỗi khi cập nhật địa điểm");

      toast.success("Cập nhật địa điểm thành công!", { id: toastId });

      setIsEditModalOpen(false);
      setPickLocation(undefined);
      setFormData({ name: "", description: "", note: "", lat: "", lng: "", province_id: "", difficulty_level: "" });
      setImageFile(null);
      setMapLink("");

      sessionStorage.removeItem("locations_cache");
      fetchLocations();

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
              {/* Lọc theo tỉnh */}
              <select
                value={filterProvince}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:w-48 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Tất cả tỉnh thành</option>
                {provinces?.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
                <LocationTable
                  locations={locations}
                  executeDelete={executeDelete}
                  setIsEditModalOpen={setIsEditModalOpen}
                  setPickLocation={setPickLocation}
                  setFormData={setFormData}
                />
              )}
            </tbody>
          </table>
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900 rounded-b-xl">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Trang {currentPage} trên {totalPages}
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
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
          imageFile={imageFile}
        />
      )}

      {isEditModalOpen && (
        <EditLocationModal
          setIsEditModalOpen={setIsEditModalOpen}
          formData={formData}
          setFormData={setFormData}
          mapLink={mapLink}
          setMapLink={setMapLink}
          setImageFile={setImageFile}
          handleInputChange={handleInputChange}
          handleExtractFromLink={handleExtractFromLink}
          handleEditSubmit={handleEditSubmit}
          provinces={provinces}
          isSaving={isSaving}
          imageFile={imageFile}
          pickLocation={pickLocation}
        />
      )}

    </div>
  );
}