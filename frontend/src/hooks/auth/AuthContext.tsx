"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from "react-hot-toast";

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("userData");

        if (storedToken && storedUser) {
            setTimeout(() => {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }, 0);
        }
    }, []);

    const login = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("userData", JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        toast.success("Đã đăng xuất thành công!");
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
    }
    return context;
};