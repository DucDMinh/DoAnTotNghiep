"use client";

import React, { useState } from "react";
import {
    MapPin, Calendar, Edit3, Share2, Map, Heart,
    Star, Settings, Camera, Compass
} from "lucide-react";

export default function UserProfilePage() {
    const [activeTab, setActiveTab] = useState("trips");

    // Mock Dữ liệu User
    const userData = {
        name: "Nguyễn Lê Hoàng",
        handle: "@hoangtraveler",
        bio: "Kẻ mộng mơ thích đi lạc. Đam mê chụp ảnh film và săn mây Tây Bắc. ☁️📷",
        location: "Hà Nội, Việt Nam",
        joinDate: "Tháng 3, 2023",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
        cover: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop",
        stats: {
            trips: 12,
            saved: 45,
            followers: 128,
            following: 56
        }
    };

    // Mock Dữ liệu Lộ trình
    const myTrips = [
        { id: 1, title: "Hà Giang - Săn mây Tà Xùa", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=600&auto=format&fit=crop", views: 1.2, likes: 340 },
        { id: 2, title: "Foodtour Hải Phòng cuối tuần", image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=600&auto=format&fit=crop", views: 0.8, likes: 120 },
        { id: 3, title: "Chữa lành tại Đà Lạt", image: "https://images.unsplash.com/photo-1542013897-440266023223?q=80&w=600&auto=format&fit=crop", views: 2.5, likes: 580 },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-paper)] pb-20">

            {/* 1. ẢNH BÌA (COVER PHOTO) */}
            <div className="relative w-full h-64 md:h-80 bg-gray-200 group">
                <img
                    src={userData.cover}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl font-bold hover:bg-white/30 transition">
                        <Camera className="w-4 h-4" /> Đổi ảnh bìa
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 2. THÔNG TIN CÁ NHÂN (PROFILE INFO) */}
                <div className="relative -mt-16 sm:-mt-24 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

                        {/* Avatar & Tên */}
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[var(--bg-paper)] overflow-hidden shadow-md bg-[var(--bg-card)] shrink-0 group">
                                <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            <div className="pb-2">
                                <h1 className="text-3xl font-display font-bold text-[var(--text-main)]">{userData.name}</h1>
                                <p className="text-sm font-medium text-[var(--text-muted)]">{userData.handle}</p>
                            </div>
                        </div>

                        {/* Nút hành động */}
                        <div className="flex items-center gap-3 pb-2">
                            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] font-bold hover:bg-[var(--accent-primary)] hover:text-white hover:border-[var(--accent-primary)] transition-colors shadow-sm">
                                <Edit3 className="w-4 h-4" /> Chỉnh sửa
                            </button>
                            <button className="flex items-center justify-center p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors shadow-sm">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button className="flex items-center justify-center p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors shadow-sm">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tiểu sử & Meta */}
                    <div className="mt-6 max-w-2xl">
                        <p className="text-[var(--text-main)] leading-relaxed">{userData.bio}</p>

                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium text-[var(--text-muted)]">
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {userData.location}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Tham gia {userData.joinDate}</span>
                        </div>

                        {/* Thống kê nhanh */}
                        <div className="flex items-center gap-6 mt-6">
                            <div className="flex flex-col"><span className="text-xl font-bold text-[var(--text-main)]">{userData.stats.trips}</span><span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">Lộ trình</span></div>
                            <div className="flex flex-col"><span className="text-xl font-bold text-[var(--text-main)]">{userData.stats.saved}</span><span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">Đã lưu</span></div>
                            <div className="flex flex-col cursor-pointer hover:opacity-80"><span className="text-xl font-bold text-[var(--text-main)]">{userData.stats.followers}</span><span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">Người theo dõi</span></div>
                            <div className="flex flex-col cursor-pointer hover:opacity-80"><span className="text-xl font-bold text-[var(--text-main)]">{userData.stats.following}</span><span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">Đang theo dõi</span></div>
                        </div>
                    </div>
                </div>

                {/* 3. TABS ĐIỀU HƯỚNG */}
                <div className="flex items-center gap-8 border-b border-[var(--border-color)] mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    {[
                        { id: "trips", label: "Lộ trình của tôi", icon: Map },
                        { id: "saved", label: "Đã lưu", icon: Heart },
                        { id: "reviews", label: "Đánh giá", icon: Star }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* 4. NỘI DUNG THEO TAB */}
                {activeTab === "trips" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myTrips.map(trip => (
                            <div key={trip.id} className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer">
                                <div className="h-48 relative overflow-hidden">
                                    <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <Heart className="w-3 h-3 fill-current" /> {trip.likes}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg line-clamp-1 mb-2 group-hover:text-[var(--accent-primary)] transition-colors">{trip.title}</h3>
                                    <div className="flex justify-between items-center text-sm font-medium text-[var(--text-muted)]">
                                        <span>{trip.views}k lượt xem</span>
                                        <Edit3 className="w-4 h-4 hover:text-[var(--accent-primary)]" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Nút Tạo mới */}
                        <div className="h-[280px] rounded-3xl border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 transition-colors cursor-pointer">
                            <Compass className="w-10 h-10 mb-3" />
                            <span className="font-bold">Tạo lộ trình mới</span>
                        </div>
                    </div>
                )}

                {activeTab === "saved" && (
                    <div className="text-center py-20">
                        <Heart className="w-16 h-16 mx-auto text-[var(--text-muted)] opacity-30 mb-4" />
                        <h3 className="text-lg font-bold mb-2">Chưa có mục nào được lưu</h3>
                        <p className="text-[var(--text-muted)]">Hãy khám phá cộng đồng và lưu lại những lộ trình bạn yêu thích.</p>
                    </div>
                )}

                {activeTab === "reviews" && (
                    <div className="text-center py-20">
                        <Star className="w-16 h-16 mx-auto text-[var(--text-muted)] opacity-30 mb-4" />
                        <h3 className="text-lg font-bold mb-2">Chưa có đánh giá nào</h3>
                        <p className="text-[var(--text-muted)]">Những đánh giá của bạn về các địa điểm sẽ xuất hiện tại đây.</p>
                    </div>
                )}
            </div>
        </div>
    );
}