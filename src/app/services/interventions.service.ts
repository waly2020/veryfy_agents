import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

type StatutTache = 'en_attente' | 'en_cours' | 'terminee' | 'annulee';
type PrioriteTache = 'basse' | 'normale' | 'haute' | 'urgente';

export interface InterventionApiItem {
  id: number;
  titre: string;
  statut: StatutTache;
  priorite: PrioriteTache;
  date_debut: string;
  date_fin?: string | null;
  adresse?: string | null;
  ville?: string | null;
  client?: { id: number; nom: string };
  entreprise?: { id: number; nom: string };
  agents?: Array<{ id: number; nom: string }>;
  documents?: Array<{ id: number }>;
  documents_count?: number;
  checklists?: Array<{ id: number; termine: boolean }>;
}

type ApiPayload<T> =
  | T[]
  | {
      data?: T[] | { data?: T[] };
      taches?: T[] | { data?: T[] };
      current_page?: number;
      agent?: unknown;
    };

interface ApiListResponse<T> {
  success?: boolean;
  data: ApiPayload<T>;
}

@Injectable({
  providedIn: 'root',
})
export class InterventionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  async fetchByAgent(agentId: number): Promise<InterventionApiItem[]> {
    const endpoint = `${this.baseUrl}/taches/agent/${agentId}`;

    try {
      const response = await lastValueFrom(
        this.http.get<ApiListResponse<InterventionApiItem>>(endpoint)
      );

      return this.normalizePayload(response.data);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  private normalizePayload(payload: ApiPayload<InterventionApiItem>): InterventionApiItem[] {
    if (!payload) {
      return [];
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    const directData = payload.data;
    if (Array.isArray(directData)) {
      return directData;
    }

    if (directData && typeof directData === 'object' && 'data' in directData) {
      const nestedData = (directData as { data?: InterventionApiItem[] }).data;
      if (Array.isArray(nestedData)) {
        return nestedData;
      }
    }

    const tachesField = payload.taches;
    if (Array.isArray(tachesField)) {
      return tachesField;
    }

    if (tachesField && typeof tachesField === 'object' && 'data' in tachesField) {
      const nestedTaches = (tachesField as { data?: InterventionApiItem[] }).data;
      if (Array.isArray(nestedTaches)) {
        return nestedTaches;
      }
    }

    return [];
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

    return "Impossible de récupérer les interventions de l'agent.";
  }
}

