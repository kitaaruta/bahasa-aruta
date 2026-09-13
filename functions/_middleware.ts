import { PagesFunction } from './_types';

const PROTECTED_PREFIXES = [
  '/portal',
  '/area-kontributor',
  '/area-verifikator',
  '/area-admin',
  '/area-superadmin',
];

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    const cookieHeader = context.request.headers.get('Cookie') || '';
    const hasSession = cookieHeader.includes('aruta_session=');

    if (!hasSession) {
      return Response.redirect(new URL(`/masuk/?redirect=${encodeURIComponent(pathname)}`, context.request.url), 302);
    }
  }

  return context.next();
};
