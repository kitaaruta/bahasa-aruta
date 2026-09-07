# Bahasa Aruta

Platform digital pelestarian bahasa daerah Dayak Arut.

## Fitur Utama
- **Terjemahan**: Penerjemahan dua arah (Bahasa Indonesia ↔ Dayak Arut).
- **Kamus Digital**: Kamus kosakata Dayak Arut dengan pencarian cepat, filter kategori/abjad, dan contoh kalimat.
- **Daftar Kontributor**: Menampilkan kontributor yang berperan dalam mendokumentasikan kosakata.
- **Area & Akses Kontributor**: Portal bagi kontributor untuk menambahkan kosakata baru, verifikasi adat, dan moderasi.

## Teknologi
- [Next.js 14](https://nextjs.org/) (Static Export & App Router)
- [React 18](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- [Cloudflare Pages & Workers KV](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)

## Integrasi Cloudflare KV (Bahasa_KV)
Aplikasi ini terhubung dengan Cloudflare KV:
- **Binding Name**: `Bahasa_KV`
- **KV Namespace ID**: `eddaaf1689e54ba0a11941ca0d5a1191`

Konfigurasi ini sudah tercatat di [wrangler.jsonc](file:///c:/Users/TEN/WorkSpaceTen/04.%20PEKERJAAN%20%28Create%20Value%29/02.%20NON-PROFIT/Membangun%20Digitalisasi%20dan%20Automasi/01.CODING/Aruta-id/bahasa-aruta-id/basa-v01/wrangler.jsonc).

### Pengaturan di Cloudflare Dashboard (Pages):
1. **Framework preset**: Next.js (Static HTML Export)
2. **Build command**: `npm run build`
3. **Build output directory**: `out`
4. **KV Namespace Binding**:
   - Buka project Pages Anda di Cloudflare Dashboard → **Settings** → **Functions** → **KV namespace bindings**.
   - Tambahkan binding:
     - **Variable name**: `Bahasa_KV`
     - **KV namespace**: `Bahasa_KV` (ID: `eddaaf1689e54ba0a11941ca0d5a1191`)

## Menjalankan Secara Lokal

```bash
# Instal dependensi
npm install

# Jalankan server pengembangan
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.
