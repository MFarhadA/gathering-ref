"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import ImageGrid from "../../../components/ImageGrid";
import ImageUploader from "../../../components/ImageUploader";
import ShareModal from "../../../components/ShareModal";
import DeleteModal from "../../../components/DeleteModal";
import GallerySettingsModal from "../../../components/GallerySettingsModal";
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

    // Modals
    const [showShare, setShowShare] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showDeleteGallery, setShowDeleteGallery] = useState(false);
    const [deleteImageId, setDeleteImageId] = useState<string | null>(null);

    // Loading states
    const [deletingGallery, setDeletingGallery] = useState(false);
    const [deletingImage, setDeletingImage] = useState(false);

    const router = useRouter();

    const fetchGallery = async () => {
        try {
            const res = await fetch(`/api/galleries/${id}`);
            if (res.ok) {
                const data = await res.json();
                setGallery(data);
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

    const handleDeleteImage = async () => {
        if (!deleteImageId) return;
        setDeletingImage(true);
        try {
            const res = await fetch(`/api/galleries/${id}/images/${deleteImageId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setGallery((prev) =>
                    prev
                        ? { ...prev, images: prev.images.filter((img) => img.id !== deleteImageId) }
                        : null
                );
                setDeleteImageId(null);
            }
        } catch (err) {
            console.error("Failed to delete image:", err);
        } finally {
            setDeletingImage(false);
        }
    };

    const handleDeleteGallery = async () => {
        setDeletingGallery(true);
        try {
            const res = await fetch(`/api/galleries/${id}`, { method: "DELETE" });
            if (res.ok) {
                router.push("/dashboard");
            }
        } catch (err) {
            console.error("Failed to delete gallery:", err);
        } finally {
            setDeletingGallery(false);
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
                                onClick={() => setShowSettings(true)}
                                className="btn-ghost text-sm"
                                title="Gallery settings"
                            >
                                <Settings size={15} />
                            </button>
                            <button
                                onClick={() => setShowDeleteGallery(true)}
                                className="btn-ghost text-sm text-danger hover:bg-danger/10"
                                title="Delete gallery"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>

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
                            onDelete={(imageId) => setDeleteImageId(imageId)}
                        />
                    )}
                </div>
            </main>

            {/* Share Modal */}
            <ShareModal
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                shareSlug={gallery.share_slug}
                galleryName={gallery.name}
            />

            {/* Gallery Settings Modal */}
            <GallerySettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                galleryId={id}
                initialName={gallery.name}
                initialDescription={gallery.description}
                initialPublic={gallery.is_public}
                onSaved={(updated) => {
                    setGallery((prev) => prev ? { ...prev, ...updated } : null);
                }}
            />

            {/* Delete Gallery Modal */}
            <DeleteModal
                isOpen={showDeleteGallery}
                onClose={() => setShowDeleteGallery(false)}
                onConfirm={handleDeleteGallery}
                title="Delete Gallery"
                description={`Are you sure you want to delete "${gallery.name}"? All images will be permanently removed and cannot be recovered.`}
                loading={deletingGallery}
            />

            {/* Delete Image Modal */}
            <DeleteModal
                isOpen={deleteImageId !== null}
                onClose={() => setDeleteImageId(null)}
                onConfirm={handleDeleteImage}
                title="Delete Image"
                description="Are you sure you want to delete this image? This action cannot be undone."
                loading={deletingImage}
            />
        </>
    );
}
