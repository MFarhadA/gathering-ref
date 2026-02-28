"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ImageItem {
    id: string;
    file_name: string;
    file_path: string;
    url: string;
    created_at: string;
}

interface ImageGridProps {
    images: ImageItem[];
    canDelete?: boolean;
    onDelete?: (imageId: string) => void;
}

export default function ImageGrid({ images, canDelete, onDelete }: ImageGridProps) {
    const [lightboxImage, setLightboxImage] = useState<ImageItem | null>(null);

    if (images.length === 0) {
        return null;
    }

    return (
        <>
            {/* Masonry Grid */}
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
                {images.map((image) => (
                    <div
                        key={image.id}
                        className="break-inside-avoid group relative rounded-lg overflow-hidden bg-surface cursor-pointer"
                        onClick={() => setLightboxImage(image)}
                    >
                        <img
                            src={image.url}
                            alt={image.file_name}
                            className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end">
                            <div className="w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-xs text-white/80 truncate">{image.file_name}</p>
                            </div>
                        </div>
                        {/* Delete button */}
                        {canDelete && onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(image.id);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-danger transition-all"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <img
                        src={lightboxImage.url}
                        alt={lightboxImage.file_name}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg animate-fade-in-scale"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
