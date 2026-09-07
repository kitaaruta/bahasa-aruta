import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [],
    message: 'Local fallback: antrean moderasi aktif',
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: 'Status antrean berhasil diperbarui',
      data: body,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}
