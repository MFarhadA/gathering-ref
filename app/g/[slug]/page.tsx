import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ImageGrid from "../../components/ImageGrid";
import Navbar from "../../components/Navbar";
import { Globe, ImageIcon, User } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: gallery } = await supabase
        .from("galleries")
        .select("name, description")
        .eq("share_slug", slug)
        .eq("is_public", true)
        .single();

    if (!gallery) {
        return { title: "Gallery Not Found" };
    }

    return {
        title: gallery.name,
        description: gallery.description || `View the "${gallery.name}" image gallery on GatheringRef.`,
        openGraph: {
            title: `${gallery.name} — GatheringRef`,
            description: gallery.description || `View the "${gallery.name}" image gallery on GatheringRef.`,
            type: "website",
        },
    };
}

export default async function PublicGalleryPage({ params }: Props) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch gallery by share slug
    const { data: gallery } = await supabase
        .from("galleries")
        .select("*")
        .eq("share_slug", slug)
        .eq("is_public", true)
        .single();

    if (!gallery) {
        notFound();
    }

    // Fetch author profile
    const { data: authorProfile } = await supabase
        .from("profiles")
        .select("nickname, avatar_url")
        .eq("id", gallery.user_id)
        .single();

    // Fetch images
    const { data: images } = await supabase
        .from("images")
        .select("*")
        .eq("gallery_id", gallery.id)
        .order("created_at", { ascending: false });

    const imagesWithUrls = (images || []).map((img) => {
        const { data: urlData } = supabase.storage
            .from("gallery-images")
            .getPublicUrl(img.file_path);
        return { ...img, url: urlData.publicUrl };
    });

    // Author avatar helper
    const authorNickname = authorProfile?.nickname ?? "Unknown";
    const authorInitials = authorNickname
        .split(/[_\s]/)
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10 animate-fade-in">
                        <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-border-light text-text-muted mb-4">
                            <Globe size={10} />
                            Public Gallery
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{gallery.name}</h1>
                        {gallery.description && (
                            <p className="text-text-muted max-w-xl mx-auto">{gallery.description}</p>
                        )}

                        {/* Author info */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                            {authorProfile?.avatar_url ? (
                                <img
                                    src={authorProfile.avatar_url}
                                    alt={authorNickname}
                                    className="w-7 h-7 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                                    {authorInitials || <User size={12} />}
                                </div>
                            )}
                            <span className="text-sm text-text-muted">
                                by <span className="text-text-secondary font-medium">{authorNickname}</span>
                            </span>
                        </div>

                        <p className="text-xs text-text-muted mt-3">
                            {imagesWithUrls.length} image{imagesWithUrls.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Images */}
                    {imagesWithUrls.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
                                <ImageIcon size={24} className="text-text-muted" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">This gallery is empty</h3>
                            <p className="text-sm text-text-muted">No images have been added yet.</p>
                        </div>
                    ) : (
                        <ImageGrid images={imagesWithUrls} />
                    )}

                    {/* Footer */}
                    <div className="text-center mt-16 pt-8 border-t border-border">
                        <p className="text-xs text-text-muted">
                            Shared via{" "}
                            <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors font-medium">
                                GatheringRef
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
