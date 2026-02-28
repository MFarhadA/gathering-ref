import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; imageId: string }> }
) {
    const { id: galleryId, imageId } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get image record
    const { data: image } = await supabase
        .from("images")
        .select("*")
        .eq("id", imageId)
        .eq("gallery_id", galleryId)
        .eq("user_id", user.id)
        .single();

    if (!image) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete from storage
    await supabase.storage.from("gallery-images").remove([image.file_path]);

    // Delete record
    const { error } = await supabase
        .from("images")
        .delete()
        .eq("id", imageId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
