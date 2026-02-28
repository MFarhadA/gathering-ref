import Link from "next/link";
import Navbar from "./components/Navbar";
import { ImageIcon, Lock, Globe, Share2, Zap, Shield, Layers } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "GatheringRef — Collect & Share Image References",
  description:
    "Your visual reference library. Create galleries, upload images, and share your curated collections with the world — or keep them private. Built for designers, artists, and creatives.",
  openGraph: {
    title: "GatheringRef — Collect & Share Image References",
    description:
      "Your visual reference library. Create galleries, upload images, and share your curated collections.",
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          {/* Background glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/2 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-white/1.5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center">

            {/* Heading */}
            <h1 className="animate-slide-up stagger-2 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Collect. Organize.
              <br />
              <span className="relative">
                Share.
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6C50 2 150 2 198 6" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-slide-up stagger-3 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Create curated image galleries for your design references, mood boards,
              and visual inspiration. Keep them private or share with anyone.
            </p>

            {/* CTA */}
            <div className="animate-slide-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-base px-8 py-3">
                <Zap size={18} />
                Start Collecting
              </Link>
              <Link href="/login" className="btn-secondary text-base px-8 py-3">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything you need
              </h2>
              <p className="text-text-secondary text-lg max-w-xl mx-auto">
                A simple, elegant way to manage your visual references
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: <Layers size={22} />,
                  title: "Organized Galleries",
                  desc: "Create unlimited galleries to categorize and organize your image references by project, theme, or mood.",
                },
                {
                  icon: <Lock size={22} />,
                  title: "Private by Default",
                  desc: "Your galleries are private by default. Only you can see them unless you choose to share.",
                },
                {
                  icon: <Globe size={22} />,
                  title: "Public Sharing",
                  desc: "Make any gallery public and share its unique link. Anyone can view — no login required.",
                },
                {
                  icon: <Share2 size={22} />,
                  title: "Shareable Links",
                  desc: "Each public gallery gets a unique link that you can share via chat, email, or social media.",
                },
                {
                  icon: <ImageIcon size={22} />,
                  title: "Drag & Drop Upload",
                  desc: "Upload images easily by dragging and dropping them directly into your gallery.",
                },
                {
                  icon: <Shield size={22} />,
                  title: "Secure Auth",
                  desc: "Sign up with email or use Google login. Your data stays safe with enterprise-grade security.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="card-hover group animate-slide-up"
                  style={{ animationDelay: `${0.1 * (i + 1)}s`, opacity: 0 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 text-accent group-hover:bg-accent group-hover:text-bg transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                How it works
              </h2>
              <p className="text-text-secondary text-lg">
                Three simple steps to start curating
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Create a Gallery",
                  desc: "Sign up and create your first gallery. Set it as private or public.",
                },
                {
                  step: "02",
                  title: "Upload Images",
                  desc: "Drag and drop your reference images into the gallery. Organize as you like.",
                },
                {
                  step: "03",
                  title: "Share or Keep Private",
                  desc: "Share the link for public galleries, or keep your collection to yourself.",
                },
              ].map((item, i) => (
                <div key={i} className="text-center group">
                  <div className="text-5xl font-black text-text-muted/20 group-hover:text-text-muted/40 transition-colors mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to start?
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              Create your first gallery in seconds. Free forever.
            </p>
            <Link href="/register" className="btn-primary text-base px-10 py-3.5">
              <Zap size={18} />
              Get Started — It&apos;s Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center">
                <Image src="/gatheringref-icon.svg" alt="GatheringRef Logo" width={20} height={20} />
              </div>
              <span className="font-semibold text-sm">GatheringRef</span>
            </div>
            <p className="text-xs text-text-muted">
              &copy; {new Date().getFullYear()} GatheringRef. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
