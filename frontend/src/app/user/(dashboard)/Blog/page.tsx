/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    MessageCircle,
    Send,
    Bookmark,
    MoreHorizontal,
    MapPin,
    Image as ImageIcon,
    Smile,
    Search
} from "lucide-react";

// --- MOCK DATA DẠNG SOCIAL FEED ---
const MOCK_POSTS = [
    {
        id: "post_1",
        author: {
            name: "Đào Minh Đức",
            avatar: "https://i.pravatar.cc/150?u=duc",
            badge: "Chuyên gia Review"
        },
        location: "Mèo Vạc, Hà Giang",
        time: "2 giờ trước",
        content: "Hà Giang mùa hoa tam giác mạch đẹp ngỡ ngàng. Chuyến đi 3 ngày 2 đêm cùng nhóm bạn thực sự là một trải nghiệm khó quên. Khuyên thật lòng các bạn nên thuê xe máy tự lái để cảm nhận hết sự hùng vĩ của dốc Thẩm Mã nhé! 🌸⛰️🛵",
        image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1200&auto=format&fit=crop",
        likes: 1245,
        comments: 84,
        isLiked: true,
        isSaved: false
    },
    {
        id: "post_2",
        author: {
            name: "Nguyễn Thảo Vy",
            avatar: "https://i.pravatar.cc/150?u=vy",
            badge: "Local Guide"
        },
        location: "Đồi chè Cầu Đất, Đà Lạt",
        time: "5 giờ trước",
        content: "Bỏ phố về rừng một vài hôm. 🌲 Chỗ này săn mây buổi sáng sớm siêu đỉnh luôn mọi người ơi. Lên tới nơi gọi một ly trà nóng, hít thở không khí se lạnh, mọi muộn phiền như tan biến hết.",
        image: "https://images.unsplash.com/photo-1550650162-42171d607a75?q=80&w=1200&auto=format&fit=crop",
        likes: 892,
        comments: 42,
        isLiked: false,
        isSaved: true
    },
    {
        id: "post_3",
        author: {
            name: "Trần Tuấn Hưng",
            avatar: "https://i.pravatar.cc/150?u=hung",
            badge: "Thành viên mới"
        },
        location: "Đảo Phú Quý, Bình Thuận",
        time: "Hôm qua lúc 15:30",
        content: "Nước biển Phú Quý trong vắt nhìn thấy cả đáy. Kinh nghiệm cho ai hay say sóng là nhớ uống thuốc trước 30p khi lên tàu Superdong nhé. Ra đảo thuê xe máy chạy vòng quanh bao chill 🌊🌊",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1200&auto=format&fit=crop",
        likes: 543,
        comments: 12,
        isLiked: false,
        isSaved: false
    }
];

export default function CommunityPage() {
    const [posts, setPosts] = useState(MOCK_POSTS);

    // Xử lý hiệu ứng thả tim (Like)
    const handleLike = (postId: string) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    isLiked: !post.isLiked,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1
                };
            }
            return post;
        }));
    };

    // Xử lý hiệu ứng lưu bài (Save/Bookmark)
    const handleSave = (postId: string) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return { ...post, isSaved: !post.isSaved };
            }
            return post;
        }));
    };

    return (
        <div className="min-h-screen bg-[var(--bg-paper)] py-6 md:py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">

                {/* --- HEADER TÌM KIẾM --- */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết, địa điểm, chuyến đi..."
                            className="w-full pl-11 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-sm outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* --- KHU VỰC TẠO BÀI VIẾT (Giống Facebook) --- */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-4 mb-6 shadow-sm">
                    <div className="flex gap-3 items-center">
                        <img
                            src="https://i.pravatar.cc/150?img=11"
                            alt="Your avatar"
                            className="w-10 h-10 rounded-full object-cover border border-[var(--border-color)]"
                        />
                        <button className="flex-1 bg-[var(--bg-paper)] hover:bg-gray-100 dark:hover:bg-slate-800 text-left px-5 py-3 rounded-full text-[var(--text-muted)] text-sm font-medium transition-colors">
                            Bạn muốn chia sẻ hành trình gì hôm nay?
                        </button>
                    </div>
                    <div className="border-t border-[var(--border-color)] mt-4 pt-3 flex items-center justify-around">
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--bg-paper)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-emerald-500 font-semibold text-sm">
                            <ImageIcon className="w-5 h-5 text-emerald-500" />
                            <span className="hidden sm:inline">Ảnh/Video</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--bg-paper)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-rose-500 font-semibold text-sm">
                            <MapPin className="w-5 h-5 text-rose-500" />
                            <span className="hidden sm:inline">Check-in</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--bg-paper)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-amber-500 font-semibold text-sm">
                            <Smile className="w-5 h-5 text-amber-500" />
                            <span className="hidden sm:inline">Cảm xúc</span>
                        </button>
                    </div>
                </div>

                {/* --- BẢNG TIN (NEW FEED) --- */}
                <div className="space-y-6">
                    <AnimatePresence>
                        {posts.map((post) => (
                            <motion.article
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={post.id}
                                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] shadow-sm overflow-hidden"
                            >
                                {/* Header Bài đăng */}
                                <div className="p-4 flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover border border-[var(--border-color)]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-bold text-[15px] text-[var(--text-main)] cursor-pointer hover:underline">
                                                    {post.author.name}
                                                </h3>
                                                {/* Dấu chấm phân cách hoặc Badge */}
                                                <span className="text-[10px] font-bold bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 px-1.5 py-0.5 rounded-md hidden sm:inline-block">
                                                    {post.author.badge}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[13px] text-[var(--text-muted)] font-medium mt-0.5">
                                                <span>{post.time}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1 hover:text-[var(--text-main)] cursor-pointer">
                                                    <MapPin className="w-3 h-3" />
                                                    {post.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-paper)] rounded-full transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Nội dung Text */}
                                <div className="px-4 pb-3">
                                    <p className="text-[15px] text-[var(--text-main)] leading-relaxed whitespace-pre-wrap">
                                        {post.content}
                                    </p>
                                </div>

                                {/* Ảnh Post (Full width) */}
                                <div className="relative w-full max-h-[600px] bg-black">
                                    <img
                                        src={post.image}
                                        alt="Post content"
                                        className="w-full h-full object-cover max-h-[600px]"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Thanh Nút Tương Tác (Instagram Style) */}
                                <div className="p-2 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            className="p-2 hover:opacity-70 transition-opacity"
                                        >
                                            <Heart className={`w-7 h-7 transition-colors ${post.isLiked ? 'fill-rose-500 text-rose-500' : 'text-[var(--text-main)]'}`} />
                                        </button>
                                        <button className="p-2 hover:opacity-70 transition-opacity">
                                            <MessageCircle className="w-7 h-7 text-[var(--text-main)]" />
                                        </button>
                                        <button className="p-2 hover:opacity-70 transition-opacity">
                                            <Send className="w-7 h-7 text-[var(--text-main)]" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleSave(post.id)}
                                        className="p-2 hover:opacity-70 transition-opacity"
                                    >
                                        <Bookmark className={`w-7 h-7 transition-colors ${post.isSaved ? 'fill-yellow-500 text-yellow-500' : 'text-[var(--text-main)]'}`} />
                                    </button>
                                </div>

                                {/* Khu vực Lượt Like & Comment preview */}
                                <div className="px-4 pb-4">
                                    <p className="text-[14px] font-bold text-[var(--text-main)] mb-1 cursor-pointer">
                                        {post.likes.toLocaleString('vi-VN')} lượt thích
                                    </p>
                                    <p className="text-[14px] text-[var(--text-muted)] font-medium cursor-pointer hover:underline mb-2">
                                        Xem tất cả {post.comments} bình luận
                                    </p>

                                    {/* Nhập Comment siêu tốc */}
                                    <div className="flex items-center gap-3 mt-3">
                                        <img src="https://i.pravatar.cc/150?img=11" alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                                        <input
                                            type="text"
                                            placeholder="Thêm bình luận..."
                                            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]"
                                        />
                                        <button className="text-sm font-bold text-[var(--accent-primary)] opacity-50 cursor-default">
                                            Đăng
                                        </button>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}