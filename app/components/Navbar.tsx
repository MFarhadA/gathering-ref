"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogOut, Menu, X, Settings, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Profile {
    nickname: string;
    avatar_url: string | null;
}

function AvatarImage({ avatarUrl, nickname, size = 32 }: { avatarUrl: string | null; nickname: string; size?: number }) {
    const initials = nickname
        .split(/[_\s]/)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={nickname}
                width={size}
                height={size}
                className="rounded-full object-cover"
                style={{ width: size, height: size }}
            />
        );
    }

    return (
        <div
            className="rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent"
            style={{ width: size, height: size }}
        >
            {initials}
        </div>
    );
}

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const p = await res.json();
                    setProfile(p);
                }
            }

            setLoading(false);
        };
        getUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session?.user) setProfile(null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        setProfile(null);
        setDropdownOpen(false);
        setMobileOpen(false);
        router.push("/");
        router.refresh();
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center transition-transform duration-200 group-hover:scale-110">
                            <Image src="/gatheringref-icon.svg" alt="GatheringRef Logo" width={26} height={26} />
                        </div>
                        <span className="text-lg font-bold tracking-tight">GatheringRef</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden sm:flex items-center gap-3">
                        {loading ? (
                            <div className="h-9 w-24 rounded-lg bg-surface animate-pulse" />
                        ) : user ? (
                            <>
                                <Link href="/dashboard" className="btn-ghost text-sm">
                                    Dashboard
                                </Link>

                                {/* Profile Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-colors"
                                    >
                                        <AvatarImage
                                            avatarUrl={profile?.avatar_url ?? null}
                                            nickname={profile?.nickname ?? "User"}
                                            size={30}
                                        />
                                        <ChevronDown
                                            size={14}
                                            className={`text-text-muted transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                    {/* Dropdown menu */}
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-surface shadow-xl animate-fade-in-scale origin-top-right">
                                            {/* User info */}
                                            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                                                <AvatarImage
                                                    avatarUrl={profile?.avatar_url ?? null}
                                                    nickname={profile?.nickname ?? "User"}
                                                    size={36}
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate">
                                                        {profile?.nickname ?? "User"}
                                                    </p>
                                                    <p className="text-xs text-text-muted truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Menu */}
                                            <div className="py-1">
                                                <Link
                                                    href="/settings"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                                                >
                                                    <Settings size={15} />
                                                    Settings
                                                </Link>
                                            </div>

                                            <div className="border-t border-border py-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
                                                >
                                                    <LogOut size={15} />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn-ghost text-sm">
                                    Login
                                </Link>
                                <Link href="/register" className="btn-primary text-sm">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="sm:hidden btn-ghost p-2"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="sm:hidden border-t border-border py-4 space-y-1 animate-fade-in">
                        {loading ? null : user ? (
                            <>
                                {/* User info header */}
                                <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-surface">
                                    <AvatarImage
                                        avatarUrl={profile?.avatar_url ?? null}
                                        nickname={profile?.nickname ?? "User"}
                                        size={40}
                                    />
                                    <div className="min-w-0">
                                        <p className="font-semibold truncate">{profile?.nickname ?? "User"}</p>
                                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                                    </div>
                                </div>

                                <Link
                                    href="/dashboard"
                                    className="block px-3 py-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Settings size={15} />
                                    Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                                >
                                    <LogOut size={15} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="block px-3 py-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="block px-3 py-2 rounded-lg text-text-primary bg-accent text-center font-medium transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
