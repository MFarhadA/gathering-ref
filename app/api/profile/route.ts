import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile);
}

export async function PUT(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nickname, avatar_url } = body;

    const updates: Record<string, string> = { updated_at: new Date().toISOString() };

    if (nickname !== undefined) {
        if (typeof nickname !== "string" || nickname.trim().length < 2) {
            return NextResponse.json({ error: "Nickname must be at least 2 characters" }, { status: 400 });
        }
        updates.nickname = nickname.trim();
    }

    if (avatar_url !== undefined) {
        updates.avatar_url = avatar_url;
    }

    const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
