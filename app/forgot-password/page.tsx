"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-sm text-center animate-fade-in-scale">
                    <div className="card p-8">
                        <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={24} className="text-success" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Check your email</h2>
                        <p className="text-sm text-text-muted mb-6">
                            We sent a password reset link to{" "}
                            <strong className="text-text-primary">{email}</strong>.
                            Click the link to reset your password.
                        </p>
                        <Link href="/login" className="btn-secondary w-full flex items-center justify-center gap-2">
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/2 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8 animate-slide-up stagger-1">
                    <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                        <div className="flex items-center justify-center">
                            <Image src="/gatheringref-icon.svg" alt="GatheringRef Logo" width={36} height={36} />
                        </div>
                        <span className="text-xl font-bold">GatheringRef</span>
                    </Link>
                    <h1 className="text-2xl font-bold mb-1">Forgot password?</h1>
                    <p className="text-sm text-text-muted">
                        Enter your email and we&apos;ll send you a reset link.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up stagger-2">
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="input-field pl-10"
                            required
                        />
                    </div>

                    {error && <p className="text-sm text-danger">{error}</p>}

                    <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <p className="text-center text-sm text-text-muted mt-6 animate-slide-up stagger-3">
                    <Link href="/login" className="inline-flex items-center gap-1 text-text-primary hover:underline font-medium">
                        <ArrowLeft size={14} />
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
