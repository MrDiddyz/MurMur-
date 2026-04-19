import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await serverSupabase
    .from("runs")
    .select("id,input,winner,created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ runs: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ runs: data });
}
