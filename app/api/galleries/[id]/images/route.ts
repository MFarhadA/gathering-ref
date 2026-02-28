import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: galleryId } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify gallery ownership
    const { data: gallery } = await supabase
        .from("galleries")
        .select("id")
        .eq("id", galleryId)
        .eq("user_id", user.id)
        .single();

    if (!gallery) {
        return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Generate unique file path
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `${user.id}/${galleryId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from("gallery-images")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Insert image record
    const { data: image, error: insertError } = await supabase
        .from("images")
        .insert({
            gallery_id: galleryId,
            user_id: user.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
        })
        .select()
        .single();

    if (insertError) {
        // Cleanup uploaded file
        await supabase.storage.from("gallery-images").remove([filePath]);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from("gallery-images")
        .getPublicUrl(filePath);

    return NextResponse.json(
        { ...image, url: urlData.publicUrl },
        { status: 201 }
    );
}
