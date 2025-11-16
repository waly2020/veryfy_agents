import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EntreprisesService } from '../../../services/entreprises.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-entreprises-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './entreprises-create.html',
  styleUrl: './entreprises-create.scss',
})
export class EntreprisesCreate {
  private readonly fb = inject(FormBuilder);
  private readonly entreprisesService = inject(EntreprisesService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected errorMessage: string | null = null;
  protected isSubmitting = false;
  protected selectedDocuments: File[] = [];
  protected fieldErrors: Record<string, string[]> = {};

  protected readonly form: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
    telephone: [''],
    adresse: [''],
    ville: [''],
    secteur_activite: [''],
    rccm: [''],
    nif: [''],
    description: [''],
    site_web: [''],
    zones_geographiques: this.fb.control<string[]> ([]),
    document_types: this.fb.control<string[]> ([]),
  });

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.selectedDocuments = files;
  }

  protected addZone(value: string): void {
    if (!value.trim()) return;
    const current = this.form.get('zones_geographiques')!.value ?? [];
    this.form.get('zones_geographiques')!.setValue([...current, value.trim()]);
  }

  protected addDocType(value: string): void {
    if (!value.trim()) return;
    const current = this.form.get('document_types')!.value ?? [];
    this.form.get('document_types')!.setValue([...current, value.trim()]);
  }

  protected async submit(): Promise<void> {
    this.errorMessage = null;
    this.fieldErrors = {};
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    try {
      const agent = this.authService.currentAgent();
      await this.entreprisesService.createEntreprise({
        ...(this.form.value as any),
        agent_id: agent?.id,
        documents: this.selectedDocuments,
      });
      await this.router.navigate(['/entreprises']);
    } catch (err) {
      const anyErr = err as any;
      if (anyErr?.status === 422 && anyErr?.error?.errors) {
        this.fieldErrors = anyErr.error.errors as Record<string, string[]>;
        this.errorMessage = anyErr.error?.message || 'Erreur de validation.';
      } else {
        this.errorMessage = anyErr?.error?.message || (err instanceof Error ? err.message : 'Erreur lors de la création.');
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  protected getFieldErrors(field: string): string[] {
    const direct = this.fieldErrors[field] || [];
    // Agréger les erreurs indexées (ex: zones_geographiques.0)
    const indexedKeys = Object.keys(this.fieldErrors).filter((k) => k.startsWith(field + '.'));
    const indexed = indexedKeys.flatMap((k) => this.fieldErrors[k] || []);
    return [...direct, ...indexed];
  }
}


