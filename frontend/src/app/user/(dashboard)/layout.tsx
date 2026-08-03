/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { AppHeader } from "@/layout/user/AppHeader"; // Đổi đường dẫn cho đúng với dự án của bạn
import { usePathname } from "next/navigation";
import GlobalStyles from "@/components/user/GlobalStyles";
import { useAuth } from "@/hooks/auth/AuthContext";

export default function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeNav, setActiveNav] = useState("dashboard");
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isCreatingTrip, setIsCreatingTrip] = useState(false);
    const [theme, setTheme] = useState<"day" | "night">("day");
    const { user: currentUser } = useAuth();
    useEffect(() => {
        if (pathname === "/") setActiveNav("dashboard");
        else if (pathname.includes("/MyItinerary")) setActiveNav("trips");
        else if (pathname.includes("/wishlist")) setActiveNav("wishlist");
    }, [pathname]);
    useEffect(() => {
        if (theme === "night") {
            document.documentElement.classList.add("theme-night");
        } else {
            document.documentElement.classList.remove("theme-night");
        }
    }, [theme]);
    const notify = (msg: string, icon = "✨") => {
        toast(
            <div className="flex items-center gap-2.5 font-medium text-sm">
                <span className="text-lg">{icon}</span>
                <span>{msg}</span>
            </div>,
            {
                style: {
                    borderRadius: "16px",
                    background: "var(--bg-card)",
                    color: "var(--text-main)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    padding: "12px 16px",
                },
            }
        );
    };

    return (
        <div className="min-h-screen paper-grid selection:bg-[var(--accent-primary)] selection:text-white">
            <GlobalStyles />
            <Toaster position="bottom-right" />
            <AppHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setActiveNav={setActiveNav}
                setIsAiModalOpen={setIsAiModalOpen}
                notify={notify}
                setIsCreatingTrip={setIsCreatingTrip}
                setTheme={setTheme}
                currentUser={currentUser}
                theme={theme}
                activeNav={activeNav}
            />

            <main className="pb-20">
                {children}
            </main>

            {/* 💡 MẸO HAY: Đặt các Modal dùng chung ở đây! */}
            {/* Nếu bạn đặt Modal AI ở Layout, người dùng có thể gọi AI từ bất kỳ trang nào (Trang chủ, Wishlist, Lộ trình...) */}

            {/* <AnimatePresence>
                {isAiModalOpen && (
                    <AiPlannerModal
                        onClose={() => setIsAiModalOpen(false)}
                        onSuccess={(newTrip) => {
                           // Logic xử lý khi tạo xong
                        }}
                    />
                )}
            </AnimatePresence> */}
        </div>
    );
}