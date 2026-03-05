"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    // Supabase sends the user to this page with a session already set via the URL hash
    // We need to listen for the PASSWORD_RECOVERY event
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                // User is now in password recovery mode, they can update their password
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setTimeout(() => {
            router.push("/dashboard");
        }, 2000);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-sm text-center animate-fade-in-scale">
                    <div className="card p-8">
                        <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={24} className="text-success" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Password updated!</h2>
                        <p className="text-sm text-text-muted">
                            Your password has been reset successfully. Redirecting to dashboard...
                        </p>
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
                    <h1 className="text-2xl font-bold mb-1">Set new password</h1>
                    <p className="text-sm text-text-muted">Choose a strong password for your account.</p>
                </div>

                <form onSubmit={handleReset} className="space-y-4 animate-slide-up stagger-2">
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New password (min 6 characters)"
                            className="input-field pl-10 pr-10"
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="input-field pl-10 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {error && <p className="text-sm text-danger">{error}</p>}

                    <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
