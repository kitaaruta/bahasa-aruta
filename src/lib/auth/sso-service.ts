/**
 * Aruta Single Sign-On (SSO) OAuth 2.0 / OIDC Client Service
 * Menangani pembuatan URL otorisasi, penukaran authorization code,
 * pengambilan userinfo, dan pencabutan token (token revocation).
 *
 * Seluruh pemanggilan kredensial rahasia (client secret) HANYA dijalankan di sisi server.
 */

export interface ArutaUserInfo {
  sub: string;
  name: string;
  username: string;
  email: string;
  picture?: string;
  avatar?: string;
  role: string; // "Superadmin" | "Admin" | "Member" | peran khusus
  status: 'active' | 'suspended';
  company?: string;
  title?: string;
}

export interface ArutaTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export class ArutaSsoService {
  private static getBaseUrl(): string {
    return (
      process.env.ARUTA_SSO_BASE_URL ||
      process.env.NEXT_PUBLIC_ARUTA_SSO_BASE_URL ||
      'https://accounts.aruta.id'
    ).replace(/\/+$/, '');
  }

  public static getClientId(): string {
    return (
      process.env.ARUTA_CLIENT_ID ||
      process.env.NEXT_PUBLIC_ARUTA_CLIENT_ID ||
      'aruta_app_ue8mu3'
    );
  }

  private static getClientSecret(): string {
    return process.env.ARUTA_CLIENT_SECRET || '';
  }

  /**
   * Menentukan Redirect URI yang tepat berdasarkan konfigurasi atau host request.
   */
  public static getRedirectUri(requestUrl?: string): string {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '')}/auth/callback`;
    }
    if (requestUrl) {
      try {
        const url = new URL(requestUrl);
        return `${url.origin}/auth/callback`;
      } catch {
        // ignore
      }
    }
    return 'https://bahasa.aruta.id/auth/callback';
  }

  /**
   * Menghasilkan Authorization URL untuk membuka halaman persetujuan login Aruta SSO.
   */
  public static generateAuthorizationUrl(state: string, redirectUri: string): string {
    const baseUrl = this.getBaseUrl();
    const clientId = this.getClientId();
    const scope = 'openid profile email';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      state: state,
    });

    return `${baseUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Menukarkan authorization code menjadi Access Token ke endpoint Aruta SSO.
   * POST https://accounts.aruta.id/api/oauth/token
   */
  public static async exchangeCodeForToken(
    code: string,
    redirectUri: string
  ): Promise<ArutaTokenResponse> {
    const baseUrl = this.getBaseUrl();
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    const tokenEndpoint = `${baseUrl}/api/oauth/token`;

    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const basicAuth = btoa(`${clientId}:${clientSecret}`);

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: bodyParams.toString(),
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text();
        errorData = { error: 'invalid_response', error_description: text };
      }
      throw new Error(
        errorData.error_description ||
        errorData.message ||
        `Gagal menukar token dari Aruta SSO (${response.status} ${response.statusText})`
      );
    }

    return (await response.json()) as ArutaTokenResponse;
  }

  /**
   * Mengambil data profil pengguna (Userinfo) dengan Access Token.
   * GET https://accounts.aruta.id/api/oauth/userinfo
   */
  public static async getUserProfile(accessToken: string): Promise<ArutaUserInfo> {
    const baseUrl = this.getBaseUrl();
    const userinfoEndpoint = `${baseUrl}/api/oauth/userinfo`;

    const response = await fetch(userinfoEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: await response.text() };
      }
      throw new Error(
        errorData.error_description ||
        errorData.message ||
        `Gagal mengambil data profil dari Aruta SSO (${response.status})`
      );
    }

    const data = await response.json();
    return data as ArutaUserInfo;
  }

  /**
   * Mencabut token saat logout (Token Revocation).
   * POST https://accounts.aruta.id/api/oauth/revoke
   */
  public static async revokeToken(token: string): Promise<boolean> {
    if (!token) return true;

    try {
      const baseUrl = this.getBaseUrl();
      const clientId = this.getClientId();
      const clientSecret = this.getClientSecret();
      const revokeEndpoint = `${baseUrl}/api/oauth/revoke`;

      const bodyParams = new URLSearchParams({
        token: token,
        client_id: clientId,
        client_secret: clientSecret,
      });

      const response = await fetch(revokeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: bodyParams.toString(),
        cache: 'no-store',
      });

      return response.ok;
    } catch (err) {
      console.warn('Gagal mencabut token di Aruta SSO (non-blocking):', err);
      return false;
    }
  }

  /**
   * Memetakan peran (role) dari Aruta SSO ke peran internal aplikasi Bahasa Aruta.
   */
  public static mapSsoRoleToAppRoles(ssoRole: string = 'Member'): {
    roles: ('superadmin' | 'admin' | 'verifier' | 'contributor' | 'supporter')[];
    primaryRole: 'superadmin' | 'admin' | 'verifier' | 'contributor' | 'supporter';
    badge: string;
  } {
    const normalized = (ssoRole || '').toLowerCase().trim();

    if (normalized === 'superadmin' || normalized === 'developer') {
      return {
        roles: ['superadmin', 'admin', 'verifier', 'contributor'],
        primaryRole: 'superadmin',
        badge: 'Superadmin Ekosistem Aruta',
      };
    }

    if (normalized === 'admin') {
      return {
        roles: ['admin', 'verifier', 'contributor'],
        primaryRole: 'admin',
        badge: 'Admin Aruta SSO',
      };
    }

    if (normalized === 'verifier' || normalized === 'tetua_adat' || normalized === 'damang') {
      return {
        roles: ['verifier', 'contributor'],
        primaryRole: 'verifier',
        badge: 'Verifikator / Tetua Adat',
      };
    }

    // Default: Member / Contributor
    return {
      roles: ['contributor'],
      primaryRole: 'contributor',
      badge: 'Kontributor Aruta',
    };
  }
}
