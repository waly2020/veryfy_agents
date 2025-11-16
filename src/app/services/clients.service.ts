import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateClientPayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  password_confirmation: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  date_naissance?: string;
  type: 'particulier' | 'entreprise';
  agent_id?: number | null;
}

export interface ClientListApiItem {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  ville?: string;
  type: 'particulier' | 'entreprise';
  actif: boolean;
  date_enrollement?: string;
}

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  async createClient(payload: CreateClientPayload): Promise<void> {
    const endpoint = `${this.baseUrl}/auth/clients/register`;
    try {
      await lastValueFrom(this.http.post(endpoint, payload));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async fetchByAgent(agentId: number, page?: number, per_page?: number): Promise<ClientListApiItem[]> {
    const params: Record<string, string> = {};
    if (page) params['page'] = String(page);
    if (per_page) params['per_page'] = String(per_page);

    const endpoint = `${this.baseUrl}/clients/agent/${agentId}`;
    try {
      const response = await lastValueFrom(this.http.get<any>(endpoint, { params }));
      // Support structure décrite dans API.md: data.clients.data[]
      const items =
        response?.data?.clients?.data ??
        response?.data?.data ??
        response?.clients?.data ??
        response?.data ??
        [];
      return Array.isArray(items) ? items : [];
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const container = error as Record<string, unknown>;
      const inner = container['error'];
      if (inner && typeof inner === 'object' && 'message' in inner && typeof (inner as { message?: string }).message === 'string') {
        return (inner as { message?: string }).message as string;
      }
    }
    return 'Impossible de créer le client.';
  }
}


