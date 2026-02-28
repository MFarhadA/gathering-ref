"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
    galleryId: string;
    onUploaded: () => void;
}

export default function ImageUploader({ galleryId, onUploaded }: ImageUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (newFiles: FileList | null) => {
        if (!newFiles) return;
        const imageFiles = Array.from(newFiles).filter((f) =>
            f.type.startsWith("image/")
        );
        setFiles((prev) => [...prev, ...imageFiles]);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        setProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("file", files[i]);

                const res = await fetch(`/api/galleries/${galleryId}/images`, {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Upload failed");
                }

                setProgress(((i + 1) / files.length) * 100);
            }

            setFiles([]);
            onUploaded();
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${dragOver
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-border-light"
                    }`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center">
                        <Upload size={20} className="text-text-muted" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-text-secondary">
                            Drop images here or click to browse
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                            PNG, JPG, GIF, WEBP up to 10MB
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview files */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">
                            {files.length} file{files.length !== 1 ? "s" : ""} selected
                        </span>
                        <button
                            onClick={() => setFiles([])}
                            className="text-xs text-text-muted hover:text-text-primary transition-colors"
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {files.map((file, i) => (
                            <div key={i} className="relative aspect-square group rounded-lg overflow-hidden bg-surface">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(i);
                                    }}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Upload button */}
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="btn-primary w-full"
                    >
                        {uploading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-bg/30 rounded-full h-1.5 max-w-[120px]">
                                    <div
                                        className="bg-bg h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span>Uploading {Math.round(progress)}%</span>
                            </div>
                        ) : (
                            <>
                                <ImageIcon size={16} />
                                Upload {files.length} image{files.length !== 1 ? "s" : ""}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
