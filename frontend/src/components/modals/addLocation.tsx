"use client";
import React from "react";
import dynamic from "next/dynamic";
import {
  X, MapPin, Link as LinkIcon, Image as ImageIcon,
  UploadCloud, AlertTriangle, FileText, Map
} from "lucide-react";
import { AddLocationModalProps } from "@/interface"

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 text-sm text-gray-500 animate-pulse">
      <Map className="mr-2 h-5 w-5 text-gray-400" />
      Đang tải bản đồ...
    </div>
  ),
});

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
  isSaving,
  imageFile
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md sm:p-6 transition-all">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800 dark:border dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-5 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Thêm địa điểm mới
            </h2>
          </div>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="add-location-form" onSubmit={handleAddSubmit}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

              {/* CỘT TRÁI: BẢN ĐỒ (Chiếm 5 phần) */}
              <div className="flex flex-col space-y-5 lg:col-span-5">
                <div>
                  <label className="mb-2 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Map className="mr-2 h-4 w-4 text-brand-500" />
                    Chọn vị trí trên bản đồ *
                  </label>
                  <div className="relative z-0 h-[400px] w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all hover:border-brand-400 dark:border-gray-600">
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
                  <div className="relative">
                    <label className="mb-1 block text-xs font-medium text-gray-500">Vĩ độ (Lat)</label>
                    <input
                      type="text"
                      name="lat"
                      onChange={handleInputChange}
                      required
                      value={formData.lat}
                      placeholder="VD: 21.0285"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-300"
                    />
                  </div>
                  <div className="relative">
                    <label className="mb-1 block text-xs font-medium text-gray-500">Kinh độ (Lng)</label>
                    <input
                      type="text"
                      name="lng"
                      onChange={handleInputChange}
                      required
                      value={formData.lng}
                      placeholder="VD: 105.8542"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: FORM NHẬP (Chiếm 7 phần) */}
              <div className="flex flex-col space-y-5 lg:col-span-7">

                {/* Lấy tọa độ nhanh */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                  <label className="mb-2 flex items-center text-sm font-semibold text-blue-800 dark:text-blue-300">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Lấy tọa độ nhanh từ link Google Maps
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={mapLink}
                      onChange={(e) => setMapLink(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                      placeholder="Dán link Google Maps vào đây..."
                    />
                    <button
                      type="button"
                      onClick={handleExtractFromLink}
                      className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                    >
                      Trích xuất
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tên địa điểm *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                      placeholder="VD: Đỉnh Fansipan"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      name="province_id"
                      required
                      value={formData.province_id}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
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
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Độ Khó
                    </label>
                    <select
                      name="difficulty_level"
                      value={formData.difficulty_level}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">-- Chọn độ khó --</option>
                      <option value="Dễ">Dễ (Cho người mới)</option>
                      <option value="Trung Bình">Trung Bình</option>
                      <option value="Khó">Khó (Đòi hỏi thể lực)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <FileText className="mr-2 h-4 w-4 text-gray-400" />
                    Mô tả chi tiết
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Viết vài dòng giới thiệu về vẻ đẹp, đặc điểm của nơi này..."
                  ></textarea>
                </div>

                <div>
                  <label className="mb-1 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                    Lưu ý quan trọng
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    rows={2}
                    placeholder="VD: Đường đất trơn trượt vào mùa mưa, cần mang giày trekking..."
                  ></textarea>
                </div>

                <div>
                  <label className="mb-1 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <ImageIcon className="mr-2 h-4 w-4 text-gray-400" />
                    Hình ảnh
                  </label>
                  {imageFile ? (
                    /* --- Giao diện khi ĐÃ chọn ảnh (Xem trước) --- */
                    <div className="relative h-32 w-30 rounded-xl border-2 border-gray-300 overflow-hidden dark:border-gray-600">
                      {/*eslint-disable-next-line @next/next/no-img-element*/}
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      {/* Nút xóa ảnh */}
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="absolute right-2 top-2 rounded-full bg-gray-900/60 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-red-500"
                        title="Xóa ảnh"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    /* --- Giao diện khi CHƯA chọn ảnh (Khung Upload của bạn) --- */
                    <label className="group flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-600 dark:bg-gray-900/50 dark:hover:border-brand-400 dark:hover:bg-gray-800">
                      <div className="flex flex-col items-center justify-center pb-6 pt-5">
                        <UploadCloud className="mb-2 h-8 w-8 text-gray-400 group-hover:text-brand-500" />
                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold text-brand-600 dark:text-brand-400">Nhấn để tải lên</span> hoặc kéo thả ảnh
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Hỗ trợ PNG, JPG, WEBP (Tối đa 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files ? e.target.files[0] : null;
                          setImageFile(file);
                        }}
                      />
                    </label>
                  )}
                </div>

              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/80 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/80">
          <p className="hidden text-sm text-gray-500 sm:block flex-1">
            Các trường có dấu <span className="text-red-500">*</span> là bắt buộc.
          </p>
          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="add-location-form"
              disabled={isSaving}
              className={`flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-brand-500/30 ${isSaving
                ? "cursor-not-allowed bg-brand-400"
                : "bg-brand-600 hover:bg-brand-700 hover:shadow-md"
                }`}
            >
              {isSaving ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                "Lưu địa điểm"
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};