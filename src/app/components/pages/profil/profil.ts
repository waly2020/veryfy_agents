import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './profil.html',
  styleUrl: './profil.scss',
})
export class Profil {
  private readonly authService = inject(AuthService);

  protected readonly isLoggingOut = signal(false);
  protected readonly agent = this.buildAgentViewModel();

  private buildAgentViewModel() {
    const a = this.authService.currentAgent();
    return {
      id: a?.id ?? 0,
      nom: a?.nom ?? '',
      prenom: a?.prenom ?? '',
      email: a?.email ?? '',
      telephone: (a as any)?.telephone ?? '',
      adresse: (a as any)?.adresse ?? '',
      ville: (a as any)?.ville ?? '',
      poste: (a as any)?.poste ?? '',
      specialites: (a as any)?.specialites ?? [],
      zones_geographiques: (a as any)?.zones_geographiques ?? [],
      actif: (a as any)?.actif ?? true,
      date_embauche: (a as any)?.created_at ?? '',
    };
  }

  protected async handleLogout(): Promise<void> {
    if (this.isLoggingOut()) {
      return;
    }

    this.isLoggingOut.set(true);

    try {
      await this.authService.logout();
    } finally {
      this.isLoggingOut.set(false);
    }
  }
}
