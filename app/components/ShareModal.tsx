"use client";

import { useState } from "react";
import { Copy, Check, X, Link as LinkIcon } from "lucide-react";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareSlug: string | null;
    galleryName: string;
}

export default function ShareModal({ isOpen, onClose, shareSlug, galleryName }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !shareSlug) return null;

    const shareUrl = typeof window !== "undefined"
        ? `${window.location.origin}/g/${shareSlug}`
        : `/g/${shareSlug}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md card animate-fade-in-scale">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Share Gallery</h2>
                    <button onClick={onClose} className="btn-ghost p-1.5">
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-text-secondary mb-4">
                    Share <strong>{galleryName}</strong> with anyone using this link. They can view the gallery without logging in.
                </p>

                <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-bg rounded-lg border border-border">
                        <LinkIcon size={14} className="text-text-muted shrink-0" />
                        <span className="text-sm text-text-secondary truncate">{shareUrl}</span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className={`shrink-0 p-2.5 rounded-lg transition-all duration-200 ${copied
                                ? "bg-success/20 text-success"
                                : "bg-surface-hover text-text-secondary hover:text-text-primary"
                            }`}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
