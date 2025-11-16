import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EntrepriseApiItem {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  verifie: boolean;
  actif?: boolean;
  badge_fiabilite?: string | null;
  date_enrollement?: string;
}

export interface CreateEntreprisePayload {
  nom: string;
  email: string;
  password: string;
  password_confirmation: string;
  agent_id?: number;
  telephone?: string;
  adresse?: string;
  ville?: string;
  secteur_activite?: string;
  rccm?: string;
  nif?: string;
  description?: string;
  site_web?: string;
  zones_geographiques?: string[];
  documents?: File[];
  document_types?: string[];
}

@Injectable({ providedIn: 'root' })
export class EntreprisesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  async fetchByAgent(agentId: number, page?: number, per_page?: number): Promise<EntrepriseApiItem[]> {
    const params: Record<string, string> = {};
    if (page) params['page'] = String(page);
    if (per_page) params['per_page'] = String(per_page);
    const endpoint = `${this.baseUrl}/entreprises/agent/${agentId}`;
    try {
      const response = await lastValueFrom(this.http.get<any>(endpoint, { params }));
      const items =
        response?.data?.entreprises?.data ??
        response?.data?.data ??
        response?.entreprises?.data ??
        response?.data ??
        [];
      return Array.isArray(items) ? items : [];
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async createEntreprise(payload: CreateEntreprisePayload): Promise<void> {
    const endpoint = `${this.baseUrl}/auth/entreprises/register`;
    const form = new FormData();
    form.append('nom', payload.nom);
    form.append('email', payload.email);
    form.append('password', payload.password);
    form.append('password_confirmation', payload.password_confirmation);
    if (payload.agent_id != null) form.append('agent_id', String(payload.agent_id));
    if (payload.telephone) form.append('telephone', payload.telephone);
    if (payload.adresse) form.append('adresse', payload.adresse);
    if (payload.ville) form.append('ville', payload.ville);
    if (payload.secteur_activite) form.append('secteur_activite', payload.secteur_activite);
    if (payload.rccm) form.append('rccm', payload.rccm);
    if (payload.nif) form.append('nif', payload.nif);
    if (payload.description) form.append('description', payload.description);
    if (payload.site_web) form.append('site_web', payload.site_web);
    if (payload.zones_geographiques?.length) {
      for (const z of payload.zones_geographiques) {
        form.append('zones_geographiques[]', z);
      }
    }
    if (payload.documents?.length) {
      for (const file of payload.documents) {
        form.append('documents[]', file);
      }
    }
    if (payload.document_types?.length) {
      for (const t of payload.document_types) {
        form.append('document_types[]', t);
      }
    }

    try {
      await lastValueFrom(this.http.post(endpoint, form));
    } catch (error) {
      // Renvoyer l'erreur brute pour permettre à l'UI d'afficher les erreurs de validation champ par champ
      throw error;
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
    return 'Erreur entreprise: opération impossible.';
  }
}


