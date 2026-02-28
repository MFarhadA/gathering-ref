import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "@/lib/utils";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: gallery, error } = await supabase
        .from("galleries")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error || !gallery) {
        return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    // Get images
    const { data: images } = await supabase
        .from("images")
        .select("*")
        .eq("gallery_id", id)
        .order("created_at", { ascending: false });

    // Get public URLs for images
    const imagesWithUrls = (images || []).map((img) => {
        const { data: urlData } = supabase.storage
            .from("gallery-images")
            .getPublicUrl(img.file_path);
        return { ...img, url: urlData.publicUrl };
    });

    return NextResponse.json({ ...gallery, images: imagesWithUrls });
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.is_public !== undefined) {
        updates.is_public = body.is_public;
        // Generate share slug when making public
        if (body.is_public) {
            const { data: existing } = await supabase
                .from("galleries")
                .select("share_slug")
                .eq("id", id)
                .single();
            if (!existing?.share_slug) {
                updates.share_slug = nanoid(10);
            }
        }
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from("galleries")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all images from storage first
    const { data: images } = await supabase
        .from("images")
        .select("file_path")
        .eq("gallery_id", id);

    if (images && images.length > 0) {
        const paths = images.map((img) => img.file_path);
        await supabase.storage.from("gallery-images").remove(paths);
    }

    // Delete gallery (cascade will delete image records)
    const { error } = await supabase
        .from("galleries")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
