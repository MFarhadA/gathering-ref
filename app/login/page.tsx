"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Background glow */}
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
                    <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
                    <p className="text-sm text-text-muted">Sign in to your account</p>
                </div>

                {/* Google Login */}
                <div className="animate-slide-up stagger-2">
                    <button
                        onClick={handleGoogleLogin}
                        className="btn-secondary w-full py-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-bg px-3 text-text-muted">or sign in with email</span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4 animate-slide-up stagger-3">
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

                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="input-field pl-10 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-xs text-text-muted hover:text-text-primary transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    {error && (
                        <p className="text-sm text-danger">{error}</p>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm text-text-muted mt-6 animate-slide-up stagger-4">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-text-primary hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
