import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "@/lib/utils";

// Simple nickname generator (fallback if DB trigger fails)
function generateNickname(): string {
    const adjs = ["swift", "brave", "calm", "cool", "epic", "fast", "kind", "neat", "rare", "wise", "bold", "glad", "warm", "wild"];
    const nouns = ["wolf", "hawk", "bear", "lion", "crow", "owl", "puma", "seal", "swan", "rook", "fox", "lynx", "deer", "wren"];
    const adj = adjs[Math.floor(Math.random() * adjs.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const suffix = nanoid(4);
    return `${adj}_${noun}${suffix}`;
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Ensure profile exists (fallback if DB trigger didn't run)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: existing } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("id", user.id)
                    .single();

                if (!existing) {
                    const nickname = (user.user_metadata?.full_name as string | undefined) || generateNickname();
                    await supabase.from("profiles").insert({ id: user.id, nickname });
                }
            }
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return to login on error
    return NextResponse.redirect(`${origin}/login?error=auth`);
}
