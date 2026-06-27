"use client";
import React from "react";
import dynamic from "next/dynamic";

// Gọi MapPicker bằng dynamic import để tránh lỗi SSR trong Next.js
const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
      Đang tải bản đồ...
    </div>
  ),
});

// Định nghĩa khuôn mẫu Props đã được bổ sung provinces và HTMLSelectElement
interface AddLocationModalProps {
  setIsAddModalOpen: (isOpen: boolean) => void;
  formData: {
    name: string;
    description: string;
    lat: string;
    lng: string;
    province_id: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      lat: string;
      lng: string;
      province_id: string;
    }>
  >;
  mapLink: string;
  setMapLink: (link: string) => void;
  setImageFile: (file: File | null) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleExtractFromLink: () => void;
  handleAddSubmit: (e: React.FormEvent) => Promise<void>;
  provinces: { id: string; name: string }[];
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  setIsAddModalOpen,
  formData,
  setFormData,
  mapLink,
  setMapLink,
  setImageFile,
  handleInputChange,
  handleExtractFromLink,
  handleAddSubmit,
  provinces,
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Thêm địa điểm mới
          </h2>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          <form id="add-location-form" onSubmit={handleAddSubmit}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

              {/* CỘT TRÁI: BẢN ĐỒ */}
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chọn vị trí trên bản đồ *
                  </label>
                  <div className="relative z-0 h-[400px] w-full overflow-hidden rounded-xl border border-gray-300 shadow-sm dark:border-gray-600">
                    <MapPicker
                      lat={formData.lat}
                      lng={formData.lng}
                      onLocationSelect={(lat, lng) => {
                        setFormData((prev) => ({ ...prev, lat, lng }));
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 text-xs text-gray-500">Vĩ độ (Lat)</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.lat}
                      placeholder="Chưa chọn..."
                      className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 focus:outline-none dark:bg-gray-700 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1 text-xs text-gray-500">Kinh độ (Lng)</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.lng}
                      placeholder="Chưa chọn..."
                      className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 focus:outline-none dark:bg-gray-700 dark:text-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: FORM NHẬP */}
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tên địa điểm *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    placeholder="VD: Đỉnh Fansipan"
                  />
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                  <label className="mb-2 block text-sm font-medium text-blue-800 dark:text-blue-300">
                    Lấy tọa độ nhanh từ link Google Maps (Tùy chọn)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mapLink}
                      onChange={(e) => setMapLink(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                      placeholder="https://www.google.com/maps/..."
                    />
                    <button
                      type="button"
                      onClick={handleExtractFromLink}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      Trích xuất
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-blue-600/70 dark:text-blue-400/70">
                    * Mẹo: Copy link trên thanh địa chỉ máy tính để có độ chính xác cao nhất.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    rows={4}
                    placeholder="Nhập mô tả về địa điểm này..."
                  ></textarea>
                </div>

                {/* --- ĐÃ THAY ĐỔI: Chuyển Input thành Select --- */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    name="province_id"
                    value={formData.province_id}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">-- Chọn tỉnh thành phố --</option>
                    {provinces?.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hình ảnh đại diện
                  </label>
                  <div className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-brand-500 dark:border-gray-600">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-700 dark:file:text-white"
                    />
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="add-location-form"
            className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300"
          >
            Lưu địa điểm
          </button>
        </div>

      </div>
    </div>
  );
};