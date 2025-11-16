import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AgentStatistics {
  total_clients: number;
  total_entreprises: number;
  total_taches: number;
  taches_en_attente: number;
  taches_en_cours: number;
  taches_terminees: number;
  taches_annulees: number;
  taches_urgentes: number;
}

interface AgentStatisticsResponse {
  success?: boolean;
  data: {
    agent: {
      id: number;
      nom: string;
      prenom: string;
      email: string;
    };
    statistics: AgentStatistics;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AgentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  async getAgentStatistics(agentId: number): Promise<AgentStatistics> {
    const endpoint = `${this.baseUrl}/agents/${agentId}/statistics`;

    try {
      const response = await lastValueFrom(
        this.http.get<AgentStatisticsResponse>(endpoint)
      );

      if (!response?.data?.statistics) {
        throw new Error('Statistiques indisponibles pour cet agent.');
      }

      return response.data.statistics;
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

    return 'Impossible de récupérer les statistiques de l’agent.';
  }
}

