import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientsService, ClientListApiItem } from '../../../services/clients.service';
import { AuthService } from '../../../services/auth.service';

type TypeClient = 'particulier' | 'entreprise';

interface ClientListItem {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  ville?: string;
  type: TypeClient;
  actif: boolean;
  date_enrollement?: string;
  agent?: { id: number; nom: string };
  demandes_actives: number;
  derniere_tache?: { id: number; titre: string; statut: string };
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients {
  private readonly clientsService = inject(ClientsService);
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly resume = signal([
    { label: 'Clients actifs', value: 0 },
    { label: 'En attente de validation', value: 0 },
    { label: 'Demandes en cours', value: 0 },
  ]);

  protected readonly clients = signal<ClientListItem[]>([]);

  constructor() {
    effect(() => {
      const agent = this.authService.currentAgent();
      if (agent?.id) {
        this.loadClients(agent.id);
      }
    });
  }

  private async loadClients(agentId: number): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const apiItems = await this.clientsService.fetchByAgent(agentId);
      const mapped = apiItems.map(this.mapFromApi);
      this.clients.set(mapped);
      // Simple stats
      const actifs = mapped.filter((c) => c.actif).length;
      this.resume.set([
        { label: 'Clients actifs', value: actifs },
        { label: 'En attente de validation', value: 0 },
        { label: 'Demandes en cours', value: 0 },
      ]);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Erreur inattendue.');
      this.clients.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private mapFromApi(item: ClientListApiItem): ClientListItem {
    return {
      id: item.id,
      nom: item.nom,
      prenom: item.prenom,
      email: item.email,
      telephone: item.telephone,
      ville: item.ville,
      type: item.type,
      actif: item.actif,
      date_enrollement: item.date_enrollement,
      agent: undefined,
      demandes_actives: 0,
      derniere_tache: undefined,
    };
  }
}
