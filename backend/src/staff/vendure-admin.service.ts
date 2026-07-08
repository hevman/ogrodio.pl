import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

/**
 * Serwis do komunikacji z Vendure Admin API.
 * Loguje się przy starcie i utrzymuje bearer token.
 * Automatycznie odnawia sesję gdy wygaśnie (401).
 */
@Injectable()
export class VendureAdminService implements OnModuleInit {
  private readonly logger = new Logger(VendureAdminService.name);
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;
  private authToken = '';

  constructor() {
    this.baseUrl = process.env.VENDURE_ADMIN_API_URL || 'http://commerce-server:3000/admin-api';
    this.username = process.env.VENDURE_ADMIN_USER || 'superadmin';
    this.password = process.env.VENDURE_ADMIN_PASS || 'superadmin';
  }

  async onModuleInit() {
    await this.login();
  }

  // ─── Login ──────────────────────────────────────────────────────────────

  async login(): Promise<void> {
    try {
      const res = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation Login($u: String!, $p: String!) {
            login(username: $u, password: $p) {
              ... on CurrentUser { id identifier }
              ... on InvalidCredentialsError { message }
            }
          }`,
          variables: { u: this.username, p: this.password },
        }),
      });

      // Odczytaj token z headera 'vendure-auth-token'
      const authToken = res.headers.get('vendure-auth-token');
      if (authToken) {
        this.authToken = authToken;
        this.logger.log(`Otrzymano bearer token od Vendure Admin`);
      }

      const json = await res.json() as any;
      if (json?.data?.login?.identifier) {
        this.logger.log(`Zalogowano do Vendure Admin jako: ${json.data.login.identifier}`);
      } else {
        this.logger.error(`Błąd logowania do Vendure: ${JSON.stringify(json)}`);
      }
    } catch (err: any) {
      this.logger.error(`Vendure niedostępny: ${err.message}`);
    }
  }

  // ─── Query ──────────────────────────────────────────────────────────────

  async query<T = any>(gqlQuery: string, variables: Record<string, unknown> = {}): Promise<T> {
    this.logger.log(`Wykonuję zapytanie do Vendure, token: ${this.authToken ? 'ustawiony' : 'brak'}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Użyj bearer tokena jeśli jest dostępny
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: gqlQuery, variables }),
    });

    if (res.status === 401 || res.status === 403) {
      // Sesja wygasła — odśwież i spróbuj ponownie
      this.logger.warn('Sesja Vendure wygasła, odświeżam...');
      await this.login();

      const retry = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
        },
        body: JSON.stringify({ query: gqlQuery, variables }),
      });

      if (!retry.ok) throw new Error(`Vendure API error: ${retry.status}`);
      const retryJson = await retry.json() as any;
      if (retryJson.errors?.length) throw new Error(`Vendure: ${retryJson.errors[0].message}`);
      return retryJson.data as T;
    }

    if (!res.ok) throw new Error(`Vendure API error: ${res.status}`);
    const json = await res.json() as any;
    if (json.errors?.length) throw new Error(`Vendure: ${json.errors[0].message}`);
    return json.data as T;
  }
}
