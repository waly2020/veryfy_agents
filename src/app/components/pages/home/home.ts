import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { AgentsService, AgentStatistics } from '../../../services/agents.service';

interface AgentMetricCard {
  label: string;
  value: string;
  description: string;
  trendLabel?: string;
  trendValue?: string;
}

interface AgentActivityLog {
  type: 'intervention' | 'demande' | 'document';
  titre: string;
  statut: string;
  horodatage: string;
  reference: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly authService = inject(AuthService);
  private readonly agentsService = inject(AgentsService);

  private readonly agentIdentiteFallback = {
    nom: 'Kouassi',
    prenom: 'Jean-Paul',
    poste: 'Agent senior terrain',
    email: 'jean.kouassi@veryfy.com',
    telephone: '+225 07 12 34 56 78',
    badge_fiabilite: 'Gold',
    zones_geographiques: ['Abidjan', 'Yamoussoukro', 'Grand-Bassam'],
    specialites: ['Enrôlement', 'Audit qualité', 'Intervention urgente'],
    derniere_sync: '2025-11-13T06:45:00Z',
  };

  protected readonly agentIdentite = computed(() => {
    const agent = this.authService.currentAgent();
    const fallback = this.agentIdentiteFallback;

    return {
      nom: agent?.nom ?? fallback.nom,
      prenom: agent?.prenom ?? fallback.prenom,
      poste: agent?.poste ?? fallback.poste,
      email: agent?.email ?? fallback.email,
      telephone: agent?.telephone ?? fallback.telephone,
      badge_fiabilite: agent?.badge_fiabilite ?? fallback.badge_fiabilite,
      zones_geographiques: agent?.zones_geographiques?.length ? agent.zones_geographiques : fallback.zones_geographiques,
      specialites: agent?.specialites?.length ? agent.specialites : fallback.specialites,
      derniere_sync: fallback.derniere_sync,
    };
  });

  protected readonly statsLoading = signal(false);
  protected readonly statsError = signal<string | null>(null);
  protected readonly agentStats = signal<AgentStatistics | null>(null);

  private readonly statsFallback: AgentStatistics = {
    total_clients: 0,
    total_entreprises: 0,
    total_taches: 0,
    taches_en_attente: 0,
    taches_en_cours: 0,
    taches_terminees: 0,
    taches_annulees: 0,
    taches_urgentes: 0,
  };

  protected readonly metrics = computed<AgentMetricCard[]>(() => {
    const stats = this.agentStats() ?? this.statsFallback;
    return [
      {
        label: 'Clients suivis',
        value: `${stats.total_clients}`,
        description: 'Nombre total de clients enrôlés par cet agent.',
        trendLabel: 'Entreprises',
        trendValue: `${stats.total_entreprises}`,
      },
      {
        label: 'Tâches assignées',
        value: `${stats.total_taches}`,
        description: 'Tâches actives ou historisées sur l’ensemble de la période.',
        trendLabel: 'Urgentes',
        trendValue: `${stats.taches_urgentes}`,
      },
      {
        label: 'En attente',
        value: `${stats.taches_en_attente}`,
        description: 'Interventions en file d’exécution.',
        trendLabel: 'En cours',
        trendValue: `${stats.taches_en_cours}`,
      },
      {
        label: 'Terminées',
        value: `${stats.taches_terminees}`,
        description: 'Tâches clôturées sur la période récente.',
        trendLabel: 'Annulées',
        trendValue: `${stats.taches_annulees}`,
      },
    ];
  });

  protected readonly taskStatusBreakdown = computed(() => {
    const stats = this.agentStats() ?? this.statsFallback;
    return [
      { label: 'En attente', value: stats.taches_en_attente },
      { label: 'En cours', value: stats.taches_en_cours },
      { label: 'Terminées', value: stats.taches_terminees },
      { label: 'Annulées', value: stats.taches_annulees },
      { label: 'Urgentes', value: stats.taches_urgentes },
    ];
  });

  protected readonly dernieresActivites: AgentActivityLog[] = [];

  constructor() {
    effect(() => {
      const agent = this.authService.currentAgent();
      if (agent?.id) {
        this.loadAgentStats(agent.id);
      }
    });
  }

  private async loadAgentStats(agentId: number): Promise<void> {
    this.statsLoading.set(true);
    this.statsError.set(null);

    try {
      const stats = await this.agentsService.getAgentStatistics(agentId);
      this.agentStats.set(stats);
    } catch (error) {
      console.error('[Home] Impossible de charger les statistiques agent', error);
      this.statsError.set(error instanceof Error ? error.message : 'Erreur inattendue.');
      this.agentStats.set(null);
    } finally {
      this.statsLoading.set(false);
    }
  }

}
