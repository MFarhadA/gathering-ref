import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "@/lib/utils";

export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: galleries, error } = await supabase
        .from("galleries")
        .select("*, images(id)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get cover images and count
    const galleriesWithMeta = await Promise.all(
        (galleries || []).map(async (gallery) => {
            const imageCount = gallery.images?.length ?? 0;

            let coverUrl = null;
            if (imageCount > 0) {
                const { data: coverImage } = await supabase
                    .from("images")
                    .select("file_path")
                    .eq("gallery_id", gallery.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                if (coverImage) {
                    const { data: urlData } = supabase.storage
                        .from("gallery-images")
                        .getPublicUrl(coverImage.file_path);
                    coverUrl = urlData.publicUrl;
                }
            }

            return {
                id: gallery.id,
                name: gallery.name,
                description: gallery.description,
                is_public: gallery.is_public,
                share_slug: gallery.share_slug,
                created_at: gallery.created_at,
                image_count: imageCount,
                cover_url: coverUrl,
            };
        })
    );

    return NextResponse.json(galleriesWithMeta);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, is_public } = body;

    if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const shareSlug = is_public ? nanoid(10) : null;

    const { data, error } = await supabase
        .from("galleries")
        .insert({
            user_id: user.id,
            name,
            description: description || null,
            is_public: !!is_public,
            share_slug: shareSlug,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
