import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EntreprisesService, EntrepriseApiItem } from '../../../services/entreprises.service';
import { AuthService } from '../../../services/auth.service';

interface EntrepriseListItem {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  verifie: boolean;
  badge_fiabilite?: 'Bronze' | 'Silver' | 'Gold';
  date_enrollement: string;
  services_count: number;
  employes_actifs: number;
  taches_en_cours: number;
  agent_enrolleur: { id: number; nom: string };
}

@Component({
  selector: 'app-entreprises',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './entreprises.html',
  styleUrl: './entreprises.scss',
})
export class Entreprises {
  private readonly entreprisesService = inject(EntreprisesService);
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly entreprises = signal<EntrepriseListItem[]>([]);

  constructor() {
    effect(() => {
      const agent = this.authService.currentAgent();
      if (agent?.id) {
        this.loadEntreprises(agent.id);
      }
    });
  }

  private async loadEntreprises(agentId: number): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const apiItems = await this.entreprisesService.fetchByAgent(agentId);
      const mapped = apiItems.map(this.mapFromApi);
      this.entreprises.set(mapped);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Erreur inattendue.');
      this.entreprises.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private mapFromApi(item: EntrepriseApiItem): EntrepriseListItem {
    return {
      id: item.id,
      nom: item.nom,
      email: item.email,
      telephone: item.telephone,
      adresse: item.adresse,
      ville: item.ville,
      verifie: item.verifie,
      badge_fiabilite: (item as any).badge_fiabilite ?? undefined,
      date_enrollement: (item as any).date_enrollement ?? '',
      services_count: (item as any).services_count ?? 0,
      employes_actifs: (item as any).employes_actifs ?? 0,
      taches_en_cours: (item as any).taches_en_cours ?? 0,
      agent_enrolleur: (item as any).agent_enrolleur ?? { id: 0, nom: '' },
    };
  }
}
