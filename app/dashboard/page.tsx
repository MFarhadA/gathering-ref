"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import GalleryCard from "../components/GalleryCard";
import CreateGalleryModal from "../components/CreateGalleryModal";
import { Plus, FolderOpen } from "lucide-react";

interface Gallery {
    id: string;
    name: string;
    description: string | null;
    is_public: boolean;
    share_slug: string | null;
    created_at: string;
    image_count?: number;
    cover_url?: string | null;
}

export default function DashboardPage() {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchGalleries = async () => {
        try {
            const res = await fetch("/api/galleries");
            if (res.ok) {
                const data = await res.json();
                setGalleries(data);
            }
        } catch (err) {
            console.error("Failed to fetch galleries:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGalleries();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this gallery? All images will be permanently removed.")) {
            return;
        }

        try {
            const res = await fetch(`/api/galleries/${id}`, { method: "DELETE" });
            if (res.ok) {
                setGalleries((prev) => prev.filter((g) => g.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete gallery:", err);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">My Galleries</h1>
                            <p className="text-sm text-text-muted mt-1">
                                {galleries.length} {galleries.length === 1 ? "gallery" : "galleries"}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">New Gallery</span>
                        </button>
                    </div>

                    {/* Gallery Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="h-40 -mx-5 -mt-5 mb-4 bg-surface-hover rounded-t-xl" />
                                    <div className="h-5 w-3/4 bg-surface-hover rounded mb-2" />
                                    <div className="h-4 w-1/2 bg-surface-hover rounded" />
                                </div>
                            ))}
                        </div>
                    ) : galleries.length === 0 ? (
                        <div className="text-center py-20 animate-fade-in">
                            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
                                <FolderOpen size={28} className="text-text-muted" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">No galleries yet</h2>
                            <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
                                Create your first gallery to start collecting and organizing your image references.
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn-primary"
                            >
                                <Plus size={18} />
                                Create First Gallery
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {galleries.map((gallery, i) => (
                                <div
                                    key={gallery.id}
                                    className="animate-slide-up"
                                    style={{ animationDelay: `${0.05 * i}s`, opacity: 0 }}
                                >
                                    <GalleryCard gallery={gallery} onDelete={handleDelete} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <CreateGalleryModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={fetchGalleries}
            />
        </>
    );
}
