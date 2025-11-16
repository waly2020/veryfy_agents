import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthAgent {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  poste?: string;
  telephone?: string;
  badge_fiabilite?: string;
  specialites?: string[];
  zones_geographiques?: string[];
}

type AuthAgentApi = Omit<AuthAgent, 'specialites' | 'zones_geographiques'> & {
  specialites?: string[] | string | null;
  zones_geographiques?: string[] | string | null;
};

interface LoginResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    agent: AuthAgentApi;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly tokenStorageKey = 'veryfy.agent.token';
  private readonly agentStorageKey = 'veryfy.agent.profile';
  private readonly loginEndpoint = `${environment.apiBaseUrl}/auth/agents/login`;
  private readonly logoutEndpoint = `${environment.apiBaseUrl}/auth/agents/logout`;

  private readonly tokenSignal = signal<string | null>(this.restoreFromStorage(this.tokenStorageKey));
  private readonly agentSignal = signal<AuthAgent | null>(this.restoreAgent());

  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly currentAgent = computed(() => this.agentSignal());

  async login(credentials: LoginCredentials): Promise<void> {
    try {
      const response = await lastValueFrom(
        this.http.post<LoginResponse>(this.loginEndpoint, {
          email: credentials.email,
          password: credentials.password,
        })
      );

      if (!response?.data?.token) {
        throw new Error('Réponse inattendue du serveur Veryfy.');
      }

      const normalizedAgent = this.normalizeAgent(response.data.agent);
      this.persistSession(response.data.token, normalizedAgent, credentials.remember);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.tokenSignal()) {
        await lastValueFrom(this.http.post(this.logoutEndpoint, {}));
      }
    } catch {
      // En cas d'échec, on poursuit quand même la suppression locale
    } finally {
      this.clearStorage();
      void this.router.navigateByUrl('/auth/login');
    }
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private persistSession(token: string, agent: AuthAgent | null, remember: boolean): void {
    this.tokenSignal.set(token);
    this.agentSignal.set(agent);

    if (!this.isBrowser()) {
      return;
    }

    sessionStorage.setItem(this.tokenStorageKey, token);
    sessionStorage.setItem(this.agentStorageKey, JSON.stringify(agent));

    if (remember) {
      localStorage.setItem(this.tokenStorageKey, token);
      localStorage.setItem(this.agentStorageKey, JSON.stringify(agent));
    } else {
      localStorage.removeItem(this.tokenStorageKey);
      localStorage.removeItem(this.agentStorageKey);
    }
  }

  private restoreFromStorage(key: string): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  }

  private restoreAgent(): AuthAgent | null {
    if (!this.isBrowser()) {
      return null;
    }

    const serialized = localStorage.getItem(this.agentStorageKey) ?? sessionStorage.getItem(this.agentStorageKey);

    if (!serialized) {
      return null;
    }

    try {
      const agent = JSON.parse(serialized) as AuthAgent | AuthAgentApi;
      return this.normalizeAgent(agent);
    } catch {
      return null;
    }
  }

  private clearStorage(): void {
    this.tokenSignal.set(null);
    this.agentSignal.set(null);

    if (!this.isBrowser()) {
      return;
    }

    sessionStorage.removeItem(this.tokenStorageKey);
    sessionStorage.removeItem(this.agentStorageKey);
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.agentStorageKey);
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const httpError = error as { error?: { message?: string; errors?: Record<string, string[]> } };

      if (httpError.error?.message) {
        return httpError.error.message;
      }

      if (httpError.error?.errors) {
        const firstKey = Object.keys(httpError.error.errors)[0];
        if (firstKey) {
          return httpError.error.errors[firstKey][0] ?? 'Erreur de validation';
        }
      }
    }

    return 'Impossible de se connecter. Vérifiez vos identifiants.';
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private normalizeAgent(agent: AuthAgent | AuthAgentApi | null | undefined): AuthAgent | null {
    if (!agent) {
      return null;
    }

    return {
      ...agent,
      specialites: this.ensureStringArray(agent.specialites),
      zones_geographiques: this.ensureStringArray(agent.zones_geographiques),
    };
  }

  private ensureStringArray(value: string[] | string | null | undefined): string[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return [value];
      }
    }

    return [];
  }
}

