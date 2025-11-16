import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { InterventionsService, InterventionApiItem } from '../../../services/interventions.service';
import { AgentsService, AgentStatistics } from '../../../services/agents.service';

type StatutTache = 'en_attente' | 'en_cours' | 'terminee' | 'annulee';

interface InterventionListItem {
  id: number;
  titre: string;
  statut: StatutTache;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  date_debut: string;
  date_fin?: string;
  adresse: string;
  ville: string;
  client: { id: number; nom: string };
  entreprise: { id: number; nom: string };
  agents: Array<{ id: number; nom: string }>;
  documents_count: number;
  checklists: { total: number; completees: number };
}

@Component({
  selector: 'app-interventions',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './interventions.html',
  styleUrl: './interventions.scss',
})
export class Interventions {
  private readonly authService = inject(AuthService);
  private readonly interventionsService = inject(InterventionsService);
  private readonly agentsService = inject(AgentsService);

  // labels par statut non utilisés sur l'UI actuelle

  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly interventions = signal<InterventionListItem[]>([]);
  // Statistiques Agent (API /api/agents/{id}/statistics)
  protected readonly statsLoading = signal(false);
  protected readonly statsError = signal<string | null>(null);
  protected readonly agentStats = signal<AgentStatistics | null>(null);
  protected readonly statisticCards = computed(() => {
    const stats = this.agentStats();
    if (!stats) return [];
    return [
      { label: 'À faire', value: `${stats.taches_en_attente}`, description: 'Tâches en attente' },
      { label: 'En cours', value: `${stats.taches_en_cours}`, description: 'Tâches actives' },
      { label: 'Terminées', value: `${stats.taches_terminees}`, description: 'Tâches clôturées' },
    ];
  });

  constructor() {
    effect(() => {
      const agent = this.authService.currentAgent();
      if (agent?.id) {
        this.loadInterventions(agent.id);
        this.loadAgentStats(agent.id);
      }
    });
  }

  private async loadInterventions(agentId: number): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const apiItems = await this.interventionsService.fetchByAgent(agentId);
      const mapped = apiItems.map((item) => this.mapApiItem(item));
      this.interventions.set(mapped);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Erreur inattendue.');
      this.interventions.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadAgentStats(agentId: number): Promise<void> {
    this.statsLoading.set(true);
    this.statsError.set(null);
    try {
      const stats = await this.agentsService.getAgentStatistics(agentId);
      this.agentStats.set(stats);
    } catch (error) {
      this.statsError.set(error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques.');
      this.agentStats.set(null);
    } finally {
      this.statsLoading.set(false);
    }
  }

  private mapApiItem(item: InterventionApiItem): InterventionListItem {
    const documentsCount = item.documents_count ?? item.documents?.length ?? 0;
    const totalChecklists = item.checklists?.length ?? 0;
    const completees = item.checklists?.filter((check) => check.termine).length ?? 0;

    return {
      id: item.id,
      titre: item.titre,
      statut: item.statut,
      priorite: item.priorite,
      date_debut: item.date_debut,
      date_fin: item.date_fin ?? undefined,
      adresse: item.adresse ?? 'Adresse non renseignée',
      ville: item.ville ?? 'Ville non renseignée',
      client: item.client ?? { id: 0, nom: 'Client inconnu' },
      entreprise: item.entreprise ?? { id: 0, nom: 'Entreprise inconnue' },
      agents: item.agents ?? [],
      documents_count: documentsCount,
      checklists: {
        total: totalChecklists,
        completees,
      },
    };
  }
}
