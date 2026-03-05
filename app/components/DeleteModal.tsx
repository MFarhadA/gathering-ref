"use client";

import { Trash2, X, AlertTriangle } from "lucide-react";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    loading?: boolean;
}

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    loading = false,
}: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm card animate-fade-in-scale">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center">
                            <AlertTriangle size={16} className="text-danger" />
                        </div>
                        <h2 className="text-lg font-bold">{title}</h2>
                    </div>
                    <button onClick={onClose} className="btn-ghost p-1.5" disabled={loading}>
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-text-secondary mb-6">{description}</p>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="btn-ghost flex-1 text-sm py-2.5"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-danger/90 hover:bg-danger text-white text-sm font-medium transition-colors"
                    >
                        <Trash2 size={15} />
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
