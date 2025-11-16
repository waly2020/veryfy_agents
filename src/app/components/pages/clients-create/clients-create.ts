import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientsService } from '../../../services/clients.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-clients-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './clients-create.html',
  styleUrl: './clients-create.scss',
})
export class ClientsCreate {
  private readonly fb = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = false;
  protected errorMessage: string | null = null;

  protected readonly form: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(255)]],
    prenom: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
    telephone: [''],
    adresse: [''],
    ville: [''],
    date_naissance: [''],
    type: ['particulier', [Validators.required]],
  });

  protected async submit(): Promise<void> {
    this.errorMessage = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const agent = this.authService.currentAgent();
    const payload = {
      ...this.form.value,
      agent_id: agent?.id ?? null,
    };
    try {
      await this.clientsService.createClient(payload);
      await this.router.navigate(['/clients']);
    } catch (err) {
      this.errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la création du client.";
    }
  }
}


