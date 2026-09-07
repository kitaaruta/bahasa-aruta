import './globals.css';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'Basa Arut — Digital Preservation of Dayak Arut Language',
  description: 'Digital platform preserving the Dayak Arut indigenous language: trilingual translator, comprehensive dictionary, contributor registry, and cultural donation.',
  keywords: 'Dayak Arut, Bahasa Dayak Arut, Arut Language, Kamus Dayak Arut, Kotawaringin Barat, Pangkut, Borneo Indigenous Language',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <main style={{ flexGrow: 1 }}>
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
