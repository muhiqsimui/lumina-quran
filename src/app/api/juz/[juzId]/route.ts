import { NextRequest, NextResponse } from "next/server";
import { getVersesByJuzLocal } from "@/lib/quran-service";
import { MushafMode } from "@/store/useSettingsStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ juzId: string }> }
) {
  const { juzId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const mode = (searchParams.get("mode") as MushafMode) || "kemenag";

  try {
    const data = await getVersesByJuzLocal(juzId, mode);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch juz verses" }, { status: 500 });
  }
}
