"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { Camera, Check, AlertCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface Profile {
    id: string;
    nickname: string;
    avatar_url: string | null;
}

function AvatarUpload({ avatarUrl, nickname, onUpload }: {
    avatarUrl: string | null;
    nickname: string;
    onUpload: (url: string) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const initials = nickname
        .split(/[_\s]/)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("File too large. Maximum size is 2MB.");
            return;
        }

        setPreview(URL.createObjectURL(file));
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/profile/avatar", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            const data = await res.json();
            onUpload(data.avatar_url);
        }

        setUploading(false);
        // Reset input so same file can be re-selected
        if (fileRef.current) fileRef.current.value = "";
    };

    const displaySrc = preview || avatarUrl;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center ring-2 ring-border">
                    {displaySrc ? (
                        <img src={displaySrc} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-accent">{initials || <User size={32} />}</span>
                    )}
                </div>
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                    {uploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Camera size={20} className="text-white" />
                    )}
                </button>
            </div>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
            />
            <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-xs text-accent hover:underline"
            >
                {uploading ? "Uploading..." : "Change photo"}
            </button>
            <p className="text-xs text-text-muted">PNG, JPG, GIF up to 2MB</p>
        </div>
    );
}

export default function SettingsPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [nickname, setNickname] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetch("/api/profile");
            if (res.status === 401) {
                router.push("/login");
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setNickname(data.nickname);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim() || nickname.trim().length < 2) {
            setMessage({ type: "error", text: "Nickname harus minimal 2 karakter" });
            return;
        }

        setSaving(true);
        setMessage(null);

        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname: nickname.trim() }),
        });

        if (res.ok) {
            const updated = await res.json();
            setProfile(updated);
            setNickname(updated.nickname);
            setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
        } else {
            const data = await res.json();
            setMessage({ type: "error", text: data.error || "Gagal menyimpan perubahan" });
        }

        setSaving(false);
    };

    const handleAvatarUpload = (url: string) => {
        setProfile((prev) => prev ? { ...prev, avatar_url: url } : prev);
        setMessage({ type: "success", text: "Foto profil berhasil diperbarui!" });
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen pt-24 pb-12 px-4">
                    <div className="max-w-lg mx-auto animate-pulse space-y-4">
                        <div className="h-8 w-48 bg-surface rounded" />
                        <div className="card p-6 space-y-4">
                            <div className="w-24 h-24 rounded-full bg-surface-hover mx-auto" />
                            <div className="h-10 bg-surface-hover rounded" />
                            <div className="h-10 bg-surface-hover rounded" />
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (!profile) return null;

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
                <div className="max-w-lg mx-auto">
                    {/* Header */}
                    <div className="mb-8 animate-fade-in">
                        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
                        <p className="text-sm text-text-muted mt-1">Manage your profile and preferences</p>
                    </div>

                    {/* Profile Card */}
                    <div className="card p-6 sm:p-8 animate-slide-up space-y-6">
                        {/* Avatar */}
                        <AvatarUpload
                            avatarUrl={profile.avatar_url}
                            nickname={profile.nickname}
                            onUpload={handleAvatarUpload}
                        />

                        <hr className="border-border" />

                        {/* Nickname form */}
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" htmlFor="nickname">
                                    Nickname
                                </label>
                                <input
                                    id="nickname"
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="Your nickname"
                                    className="input-field w-full"
                                    minLength={2}
                                    maxLength={30}
                                    required
                                />
                                <p className="text-xs text-text-muted mt-1">
                                    This will be shown on your public galleries.
                                </p>
                            </div>

                            {/* Message */}
                            {message && (
                                <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${message.type === "success"
                                        ? "bg-success/10 text-success"
                                        : "bg-danger/10 text-danger"
                                    }`}>
                                    {message.type === "success" ? <Check size={15} /> : <AlertCircle size={15} />}
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={saving || nickname.trim() === profile.nickname}
                                className="btn-primary w-full py-3"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </div>

                    {/* Account info */}
                    <div className="card p-6 mt-4 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
                        <h2 className="text-sm font-semibold mb-3">Account</h2>
                        <div className="space-y-2 text-sm text-text-muted">
                            <div className="flex justify-between items-center">
                                <span>Member ID</span>
                                <code className="text-xs bg-surface px-2 py-0.5 rounded font-mono truncate max-w-[180px]">
                                    {profile.id}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
