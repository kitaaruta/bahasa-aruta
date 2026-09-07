import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [],
    message: 'Local fallback: data leksikon aktif',
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: 'Kosakata berhasil disinkronkan',
      count: body?.words?.length || 0,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}
