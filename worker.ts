import { onRequestGet as getAuthUrl } from './functions/api/auth/authorize-url';
import { onRequestPost as postExchange } from './functions/api/auth/exchange';
import { onRequestGet as getSession } from './functions/api/auth/session';
import { onRequestPost as postLogout } from './functions/api/auth/logout';
import { onRequestPost as postOnboarding } from './functions/api/auth/onboarding';
import { onRequestGet as getHealth } from './functions/api/health';
import { onRequestGet as getWords, onRequestPost as postWords } from './functions/api/words';
import { onRequestGet as getModeration, onRequestPost as postModeration } from './functions/api/moderation';

export interface Env {
  ASSETS: { fetch: typeof fetch };
  Bahasa_KV?: any;
  ARUTA_CLIENT_ID?: string;
  ARUTA_CLIENT_SECRET?: string;
  ARUTA_SSO_BASE_URL?: string;
  NEXT_PUBLIC_ARUTA_CLIENT_ID?: string;
  NEXT_PUBLIC_ARUTA_SSO_BASE_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
  SESSION_SECRET?: string;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException?(): void;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const method = request.method.toUpperCase();

    // Handle CORS preflight for API requests
    if (method === 'OPTIONS' && pathname.startsWith('/api/')) {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const context: any = {
      request,
      env,
      waitUntil: (p: Promise<any>) => ctx.waitUntil(p),
      next: () => env.ASSETS.fetch(request),
      params: {},
      data: {},
    };

    // Routing Endpoint API
    if (pathname === '/api/auth/authorize-url') {
      return getAuthUrl(context);
    }
    if (pathname === '/api/auth/exchange' && method === 'POST') {
      return postExchange(context);
    }
    if (pathname === '/api/auth/session') {
      return getSession(context);
    }
    if (pathname === '/api/auth/logout' && method === 'POST') {
      return postLogout(context);
    }
    if (pathname === '/api/auth/onboarding' && method === 'POST') {
      return postOnboarding(context);
    }
    if (pathname === '/api/health') {
      return getHealth(context);
    }
    if (pathname === '/api/words') {
      return method === 'POST' ? postWords(context) : getWords(context);
    }
    if (pathname === '/api/moderation') {
      return method === 'POST' ? postModeration(context) : getModeration(context);
    }

    // Default: Layani file statis dari directory assets (./out)
    return env.ASSETS.fetch(request);
  },
};
