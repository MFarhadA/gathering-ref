"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import ImageGrid from "../../../components/ImageGrid";
import ImageUploader from "../../../components/ImageUploader";
import ShareModal from "../../../components/ShareModal";
import {
    ArrowLeft,
    Globe,
    Lock,
    Share2,
    Settings,
    Trash2,
    ImageIcon,
} from "lucide-react";
import Link from "next/link";

interface GalleryDetail {
    id: string;
    name: string;
    description: string | null;
    is_public: boolean;
    share_slug: string | null;
    created_at: string;
    images: ImageItem[];
}

interface ImageItem {
    id: string;
    file_name: string;
    file_path: string;
    url: string;
    created_at: string;
}

export default function GalleryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [gallery, setGallery] = useState<GalleryDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShare, setShowShare] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [editName, setEditName] = useState("");
    const [editPublic, setEditPublic] = useState(false);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const fetchGallery = async () => {
        try {
            const res = await fetch(`/api/galleries/${id}`);
            if (res.ok) {
                const data = await res.json();
                setGallery(data);
                setEditName(data.name);
                setEditPublic(data.is_public);
            } else {
                router.push("/dashboard");
            }
        } catch {
            router.push("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery();
    }, [id]);

    const handleDeleteImage = async (imageId: string) => {
        if (!confirm("Delete this image?")) return;

        try {
            const res = await fetch(`/api/galleries/${id}/images/${imageId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setGallery((prev) =>
                    prev
                        ? { ...prev, images: prev.images.filter((img) => img.id !== imageId) }
                        : null
                );
            }
        } catch (err) {
            console.error("Failed to delete image:", err);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/galleries/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, is_public: editPublic }),
            });
            if (res.ok) {
                const data = await res.json();
                setGallery((prev) => (prev ? { ...prev, ...data } : null));
                setShowSettings(false);
            }
        } catch (err) {
            console.error("Failed to update gallery:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGallery = async () => {
        if (
            !confirm(
                "Are you sure you want to delete this gallery? All images will be permanently removed."
            )
        )
            return;

        try {
            const res = await fetch(`/api/galleries/${id}`, { method: "DELETE" });
            if (res.ok) {
                router.push("/dashboard");
            }
        } catch (err) {
            console.error("Failed to delete gallery:", err);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto animate-pulse">
                        <div className="h-8 w-48 bg-surface rounded mb-2" />
                        <div className="h-5 w-32 bg-surface rounded mb-8" />
                        <div className="h-40 bg-surface rounded-xl" />
                    </div>
                </main>
            </>
        );
    }

    if (!gallery) return null;

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Back link */}
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
                    >
                        <ArrowLeft size={16} />
                        Back to galleries
                    </Link>

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 animate-fade-in">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl sm:text-3xl font-bold">{gallery.name}</h1>
                                {gallery.is_public ? (
                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-border-light text-text-muted">
                                        <Globe size={10} /> Public
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-border-light text-text-muted">
                                        <Lock size={10} /> Private
                                    </span>
                                )}
                            </div>
                            {gallery.description && (
                                <p className="text-sm text-text-muted">{gallery.description}</p>
                            )}
                            <p className="text-xs text-text-muted mt-1">
                                {gallery.images.length} image{gallery.images.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {gallery.is_public && gallery.share_slug && (
                                <button
                                    onClick={() => setShowShare(true)}
                                    className="btn-secondary text-sm"
                                >
                                    <Share2 size={15} />
                                    Share
                                </button>
                            )}
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="btn-ghost text-sm"
                            >
                                <Settings size={15} />
                            </button>
                            <button
                                onClick={handleDeleteGallery}
                                className="btn-ghost text-sm text-danger hover:bg-danger/10"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Settings panel */}
                    {showSettings && (
                        <div className="card mb-8 animate-fade-in-scale">
                            <h3 className="font-semibold mb-4">Gallery Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="input-field max-w-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-2">
                                        Visibility
                                    </label>
                                    <div className="flex gap-3 max-w-md">
                                        <button
                                            type="button"
                                            onClick={() => setEditPublic(false)}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${!editPublic
                                                    ? "border-accent bg-accent/10 text-text-primary"
                                                    : "border-border text-text-muted hover:border-border-light"
                                                }`}
                                        >
                                            <Lock size={14} />
                                            <span className="text-sm">Private</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditPublic(true)}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${editPublic
                                                    ? "border-accent bg-accent/10 text-text-primary"
                                                    : "border-border text-text-muted hover:border-border-light"
                                                }`}
                                        >
                                            <Globe size={14} />
                                            <span className="text-sm">Public</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={saving}
                                        className="btn-primary text-sm"
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSettings(false);
                                            setEditName(gallery.name);
                                            setEditPublic(gallery.is_public);
                                        }}
                                        className="btn-ghost text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Section */}
                    <div className="mb-8">
                        <ImageUploader galleryId={id} onUploaded={fetchGallery} />
                    </div>

                    {/* Images */}
                    {gallery.images.length === 0 ? (
                        <div className="text-center py-16 animate-fade-in">
                            <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
                                <ImageIcon size={24} className="text-text-muted" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">No images yet</h3>
                            <p className="text-sm text-text-muted">
                                Upload your first image using the uploader above.
                            </p>
                        </div>
                    ) : (
                        <ImageGrid
                            images={gallery.images}
                            canDelete
                            onDelete={handleDeleteImage}
                        />
                    )}
                </div>
            </main>

            <ShareModal
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                shareSlug={gallery.share_slug}
                galleryName={gallery.name}
            />
        </>
    );
}
