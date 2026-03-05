"use client";

import { useState, useEffect } from "react";
import { Globe, Lock, Settings, X } from "lucide-react";

interface GallerySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    galleryId: string;
    initialName: string;
    initialDescription: string | null;
    initialPublic: boolean;
    onSaved: (updated: { name: string; description: string | null; is_public: boolean; share_slug: string | null }) => void;
}

export default function GallerySettingsModal({
    isOpen,
    onClose,
    galleryId,
    initialName,
    initialDescription,
    initialPublic,
    onSaved,
}: GallerySettingsModalProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription ?? "");
    const [isPublic, setIsPublic] = useState(initialPublic);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Sync state when modal opens
    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setDescription(initialDescription ?? "");
            setIsPublic(initialPublic);
            setError("");
        }
    }, [isOpen, initialName, initialDescription, initialPublic]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Gallery name is required");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const res = await fetch(`/api/galleries/${galleryId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    is_public: isPublic,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                onSaved({
                    name: data.name,
                    description: data.description,
                    is_public: data.is_public,
                    share_slug: data.share_slug,
                });
                onClose();
            } else {
                const d = await res.json();
                setError(d.error || "Failed to save changes");
            }
        } catch {
            setError("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md card animate-fade-in-scale">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                            <Settings size={15} className="text-accent" />
                        </div>
                        <h2 className="text-lg font-bold">Gallery Settings</h2>
                    </div>
                    <button onClick={onClose} className="btn-ghost p-1.5" disabled={saving}>
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field w-full"
                            placeholder="Gallery name"
                            maxLength={100}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Description <span className="text-text-muted font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input-field w-full resize-none"
                            placeholder="Add a description..."
                            rows={3}
                            maxLength={300}
                        />
                    </div>

                    {/* Visibility */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Visibility
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsPublic(false)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm ${!isPublic
                                        ? "border-accent bg-accent/10 text-text-primary"
                                        : "border-border text-text-muted hover:border-border-light"
                                    }`}
                            >
                                <Lock size={14} />
                                Private
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPublic(true)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm ${isPublic
                                        ? "border-accent bg-accent/10 text-text-primary"
                                        : "border-border text-text-muted hover:border-border-light"
                                    }`}
                            >
                                <Globe size={14} />
                                Public
                            </button>
                        </div>
                        {isPublic && !initialPublic && (
                            <p className="text-xs text-text-muted mt-2">
                                A shareable link will be generated for this gallery.
                            </p>
                        )}
                    </div>

                    {error && (
                        <p className="text-sm text-danger">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={onClose}
                            disabled={saving}
                            className="btn-ghost flex-1 text-sm py-2.5"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex-1 text-sm py-2.5"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
