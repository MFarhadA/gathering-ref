"use client";

import Link from "next/link";
import { Globe, Lock, ImageIcon, Trash2 } from "lucide-react";

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

interface GalleryCardProps {
    gallery: Gallery;
    onDelete?: (id: string) => void;
}

export default function GalleryCard({ gallery, onDelete }: GalleryCardProps) {
    return (
        <Link
            href={`/dashboard/gallery/${gallery.id}`}
            className="group card-hover relative overflow-hidden block"
        >
            {/* Cover image or placeholder */}
            <div className="relative h-40 -mx-5 -mt-5 mb-4 bg-bg-secondary overflow-hidden">
                {gallery.cover_url ? (
                    <img
                        src={gallery.cover_url}
                        alt={gallery.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={40} className="text-text-muted/30" />
                    </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-surface to-transparent opacity-60" />
            </div>

            {/* Info */}
            <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                        {gallery.name}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {gallery.is_public ? (
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                                <Globe size={12} />
                                Public
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                                <Lock size={12} />
                                Private
                            </span>
                        )}
                    </div>
                </div>

                {gallery.description && (
                    <p className="text-sm text-text-muted line-clamp-2">
                        {gallery.description}
                    </p>
                )}

                <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-text-muted">
                        {gallery.image_count ?? 0} images
                    </span>
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete(gallery.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
}
