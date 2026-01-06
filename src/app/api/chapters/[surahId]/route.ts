import { NextRequest, NextResponse } from "next/server";
import { getVersesLocal } from "@/lib/quran-service";
import { MushafMode } from "@/store/useSettingsStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surahId: string }> }
) {
  const { surahId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const mode = (searchParams.get("mode") as MushafMode) || "kemenag";

  try {
    const data = await getVersesLocal(surahId, mode);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch verses" }, { status: 500 });
  }
}
