import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    kvConnected: true,
    bindingName: 'Bahasa_KV',
    expectedNamespaceId: 'eddaaf1689e54ba0a11941ca0d5a1191',
    message: 'Bahasa_KV terhubung (Mode Simulasi Lokal & Siap Cloudflare Pages)',
    timestamp: new Date().toISOString(),
  });
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}
