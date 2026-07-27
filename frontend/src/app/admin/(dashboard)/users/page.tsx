/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    Users,
    Shield,
    X,
    Loader2,
    CheckCircle,
    AlertTriangle,
    UserX,
    Filter,
    RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/apiClient";
import { User, UserRole } from "@/interface";
import { supabase } from "@/utils/supabaseClient";


const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string }> = {
    ADMIN: {
        label: "Quản trị viên",
        color: "text-purple-700 dark:text-purple-300",
        bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    USER: {
        label: "Người dùng",
        color: "text-blue-700 dark:text-blue-300",
        bg: "bg-blue-100 dark:bg-blue-900/30",
    },
};

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone_number: "",
        password: "",
        role: "USER" as UserRole,
        status: "active" as "active" | "inactive",
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/users");
            let rawUsers: any[] = [];
            if (data.success && Array.isArray(data.data?.data)) {
                rawUsers = data.data.data;
            } else if (Array.isArray(data.data)) {
                rawUsers = data.data;
            } else if (Array.isArray(data)) {
                rawUsers = data;
            } else {
                throw new Error("Định dạng dữ liệu không hợp lệ");
            }
            const validUsers = rawUsers.filter(
                (u: any) => u && typeof u.id !== "undefined" && u.name
            );
            setUsers(validUsers);
        } catch (error: any) {
            console.error("Lỗi khi tải người dùng:", error);
            toast.error(error?.message || "Không thể tải danh sách người dùng");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initTimer = setTimeout(() => {
            fetchUsers();
        }, 0);
        const userChannel = supabase.channel("custom-user-channel")
            .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
                sessionStorage.removeItem("users_cache");
                fetchUsers();
            }).subscribe();

        return () => {
            supabase.removeChannel(userChannel);
            clearTimeout(initTimer);
        };
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRoleFilter(e.target.value as UserRole | "all");
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value as "all" | "active" | "inactive");
        setCurrentPage(1);
    };

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            if (!user || !user.name) return false;
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            const matchesStatus = statusFilter === "all" || user.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(start, start + itemsPerPage);
    }, [filteredUsers, currentPage, itemsPerPage]);

    const openAddModal = () => {
        setSelectedUser(null);
        setFormData({
            name: "",
            email: "",
            phone_number: "",
            password: "",
            role: "USER",
            status: "active",
        });
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone_number: user.phone_number ? String(user.phone_number) : "",
            password: "",
            role: user.role,
            status: user.status,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim()) {
            toast.error("Vui lòng điền đầy đủ họ tên và email.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone_number: formData.phone_number ? parseInt(formData.phone_number, 10) : undefined,
                role: formData.role,
                status: formData.status,
            };
            if (!selectedUser || formData.password.trim()) {
                payload.password = formData.password;
            }
            if (selectedUser) {
                const { data } = await api.patch(`/users/${selectedUser.id}`, payload);
                if (data.success) {
                    setUsers((prev) =>
                        prev.map((u) =>
                            u.id === selectedUser.id ? { ...u, ...data.data } : u
                        )
                    );
                    toast.success("Cập nhật người dùng thành công!");
                    closeModal();
                    setFormData({
                        name: "",
                        email: "",
                        phone_number: "",
                        password: "",
                        role: "USER" as UserRole,
                        status: "active" as "active" | "inactive",
                    })
                } else {
                    toast.error(data.message || "Cập nhật thất bại");
                }
            } else {
                const { data } = await api.post("/users", payload);
                if (data.success) {
                    setUsers((prev) => [data.data, ...prev]);
                    toast.success("Thêm người dùng thành công!");
                    closeModal();
                    setFormData({
                        name: "",
                        email: "",
                        phone_number: "",
                        password: "",
                        role: "USER" as UserRole,
                        status: "active" as "active" | "inactive",
                    })
                } else {
                    toast.error(data.message || "Thêm mới thất bại");
                }
            }
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || error?.message || "Có lỗi xảy ra"
            );
        } finally {
            setIsSubmitting(false);

        }
    };

    const confirmDelete = (user: User) => {
        setUserToDelete(user);
        setIsDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        setIsSubmitting(true);
        try {
            await api.delete(`/users/${userToDelete.id}`);
            setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
            toast.success(`Đã xóa người dùng "${userToDelete.name}"`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Xóa thất bại");
        } finally {
            setIsSubmitting(false);
            setIsDeleteConfirmOpen(false);
            setUserToDelete(null);
        }
    };
    const toggleStatus = async (user: User) => {
        const newStatus = user.status === "active" ? "inactive" : "active";
        try {
            const { data } = await api.patch(`/users/${user.id}`, {
                status: newStatus,
            });
            if (data.success) {
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === user.id ? { ...u, status: newStatus } : u
                    )
                );
                toast.success(
                    `Đã ${newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"} tài khoản`
                );
            } else {
                toast.error(data.message || "Cập nhật trạng thái thất bại");
            }
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || "Lỗi khi cập nhật trạng thái"
            );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-950 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-7xl mx-auto"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                            Quản lý người dùng
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Tổng cộng {users.length} người dùng
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={fetchUsers}
                            disabled={loading}
                            className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:text-blue-600 transition-colors"
                            title="Tải lại"
                        >
                            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm"
                        >
                            <UserPlus className="h-4 w-4" />
                            Thêm người dùng
                        </motion.button>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/50 p-4 sm:p-6 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative col-span-1 sm:col-span-2 lg:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên hoặc email..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={roleFilter}
                                onChange={handleRoleFilterChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                            >
                                <option value="all">Tất cả vai trò</option>
                                <option value="ADMIN">Quản trị viên</option>
                                <option value="USER">Người dùng</option>
                            </select>
                        </div>

                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Vô hiệu hóa</option>
                            </select>
                        </div>
                    </div>
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/50 overflow-hidden"
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-500">Đang tải dữ liệu...</span>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 uppercase text-xs font-semibold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Người dùng</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Email</th>
                                            <th className="px-6 py-4">Vai trò</th>
                                            <th className="px-6 py-4 hidden sm:table-cell">Trạng thái</th>
                                            <th className="px-6 py-4 hidden lg:table-cell">Ngày tạo</th>
                                            <th className="px-6 py-4 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                        <AnimatePresence mode="popLayout">
                                            {paginatedUsers.length > 0 ? (
                                                paginatedUsers.map((user) => (
                                                    <motion.tr
                                                        key={user.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                                    {user.name
                                                                        .split(" ")
                                                                        .map((n) => n[0])
                                                                        .join("")
                                                                        .toUpperCase()
                                                                        .slice(0, 2)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                                        {user.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 md:hidden">{user.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 hidden md:table-cell text-gray-600 dark:text-gray-300">
                                                            {user.email}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_CONFIG[user.role]?.bg || ""} ${ROLE_CONFIG[user.role]?.color || ""}`}
                                                            >
                                                                {ROLE_CONFIG[user.role]?.label || user.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 hidden sm:table-cell">
                                                            <button
                                                                onClick={() => toggleStatus(user)}
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${user.status === "active"
                                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                                                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                                                    }`}
                                                            >
                                                                {user.status === "active" ? (
                                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                                ) : (
                                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                                )}
                                                                {user.status === "active" ? "Hoạt động" : "Vô hiệu"}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 hidden lg:table-cell text-gray-500 text-xs">
                                                            {user.created_at
                                                                ? new Intl.DateTimeFormat("vi-VN", {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    timeZone: "Asia/Ho_Chi_Minh",
                                                                }).format(new Date(user.created_at))
                                                                : "—"}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => openEditModal(user)}
                                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => confirmDelete(user)}
                                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                                                                    title="Xóa"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-16 text-center">
                                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                                            <UserX className="h-10 w-10" />
                                                            <p className="text-base font-medium">Không tìm thấy người dùng</p>
                                                            <p className="text-sm">
                                                                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700/50">
                                    <p className="text-xs text-gray-500">
                                        Hiển thị {(currentPage - 1) * itemsPerPage + 1}-
                                        {Math.min(currentPage * itemsPerPage, filteredUsers.length)} trên tổng{" "}
                                        {filteredUsers.length} người dùng
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${currentPage === page
                                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </motion.div>
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    {selectedUser ? (
                                        <>
                                            <Pencil className="h-5 w-5 text-blue-600" />
                                            Chỉnh sửa người dùng
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-5 w-5 text-blue-600" />
                                            Thêm người dùng mới
                                        </>
                                    )}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        placeholder="Nguyễn Văn A"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        placeholder="email@example.com"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {!selectedUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Mật khẩu
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleFormChange}
                                            placeholder="••••••••"
                                            required
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Phone number
                                    </label>
                                    <input
                                        type="phone_number"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleFormChange}
                                        placeholder="0123456789"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Vai trò
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                                        >
                                            <option value="USER">Người dùng</option>
                                            <option value="ADMIN">Quản trị viên</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Trạng thái
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                                        >
                                            <option value="active">Hoạt động</option>
                                            <option value="inactive">Vô hiệu hóa</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Đang lưu...
                                            </>
                                        ) : selectedUser ? (
                                            "Cập nhật"
                                        ) : (
                                            "Thêm mới"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isDeleteConfirmOpen && userToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteConfirmOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 text-center"
                        >
                            <div className="w-14 h-14 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="h-7 w-7 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Xác nhận xóa
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Bạn có chắc muốn xóa người dùng{" "}
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {userToDelete.name}
                                </span>
                                ? Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-md shadow-red-500/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang xóa...
                                        </>
                                    ) : (
                                        "Xóa vĩnh viễn"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}