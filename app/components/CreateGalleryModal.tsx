"use client";

import { useState } from "react";
import { X, Globe, Lock } from "lucide-react";

interface CreateGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateGalleryModal({
    isOpen,
    onClose,
    onCreated,
}: CreateGalleryModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/galleries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), description: description.trim(), is_public: isPublic }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create gallery");
            }

            setName("");
            setDescription("");
            setIsPublic(false);
            onCreated();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md card animate-fade-in-scale">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Create Gallery</h2>
                    <button onClick={onClose} className="btn-ghost p-1.5">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Gallery Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Reference Board"
                            className="input-field"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description..."
                            className="input-field resize-none"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Visibility
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsPublic(false)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200 ${!isPublic
                                        ? "border-accent bg-accent/10 text-text-primary"
                                        : "border-border text-text-muted hover:border-border-light"
                                    }`}
                            >
                                <Lock size={16} />
                                <span className="text-sm font-medium">Private</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPublic(true)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200 ${isPublic
                                        ? "border-accent bg-accent/10 text-text-primary"
                                        : "border-border text-text-muted hover:border-border-light"
                                    }`}
                            >
                                <Globe size={16} />
                                <span className="text-sm font-medium">Public</span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-danger">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="btn-primary w-full"
                    >
                        {loading ? "Creating..." : "Create Gallery"}
                    </button>
                </form>
            </div>
        </div>
    );
}
