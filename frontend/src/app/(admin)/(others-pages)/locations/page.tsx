"use client"; // Bắt buộc phải có để dùng React Hooks
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

// Định nghĩa kiểu dữ liệu (TypeScript) cho 1 địa điểm
type Location = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  img: string | null;
};

export default function LocationsPage() {
  // 1. Tạo biến state để chứa dữ liệu từ Backend
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải

  // 2. Hàm gọi API từ Koa.js Backend
  const fetchLocations = async () => {
    try {
      const response = await fetch("http://localhost:8000/locations");

      const result = await response.json();
      console.log("Dữ liệu từ API (mở rộng ra xem nhé):", result);

      if (Array.isArray(result)) {
        setLocations(result);
      } else if (result.data && Array.isArray(result.data)) {
        setLocations(result.data);
      } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
        setLocations(result.data.data);
      } else if (result.success && result.data) {
        setLocations([result.data]);
      } else {
        console.error("Không tìm thấy mảng dữ liệu. Cấu trúc đang có:", result);
        setLocations([]);
      }
    } catch (error) {
      console.error("Lỗi kết nối đến máy chủ:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchLocations();
  }, []);

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
                <th className="px-6 py-3">Tọa độ (Lat, Lng)</th>
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
                      {loc.lat}, {loc.lng}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="font-medium text-blue-600 hover:underline mr-3">
                        Sửa
                      </button>
                      <button className="font-medium text-red-600 hover:underline">
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