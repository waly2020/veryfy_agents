import { Component, computed, effect, inject, signal, ViewChild, ElementRef, viewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TachesService } from '../../../services/taches.service';
import { ChecklistsService } from '../../../services/checklists.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

type StatutTache = 'en_attente' | 'en_cours' | 'terminee' | 'annulee';

type PrioriteTache = 'basse' | 'normale' | 'haute' | 'urgente';

interface ChecklistItem {
  id: number;
  titre: string;
  description: string;
  termine: boolean;
  ordre: number;
}

interface DocumentItem {
  id: number;
  type_document: string;
  description: string;
  url: string;
  extension?: string;
  created_at: string;
}

interface CommentaireItem {
  id: number;
  auteur: string;
  role: 'agent' | 'client' | 'entreprise';
  contenu: string;
  created_at: string;
}

interface TacheDetailData {
  id: number;
  titre: string;
  description: string;
  statut: StatutTache;
  priorite: PrioriteTache;
  adresse: string;
  ville: string;
  date_debut: string;
  date_fin_prevue: string;
  date_fin_reelle: string | null;
  entreprise: { id: number; nom: string; telephone: string };
  client: { id: number; nom: string; contact: string; email: string };
  agents: Array<{ id: number; nom: string; role: string }>;
  employers: Array<{ id: number; nom: string; poste: string }>;
  cout_estimatif: number;
  documents: DocumentItem[];
  checklists: ChecklistItem[];
  commentaires: CommentaireItem[];
  timeline: Array<{ label: string; date: string }>;
}

@Component({
  selector: 'app-tache-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  templateUrl: './tache-detail.html',
  styleUrl: './tache-detail.scss',
})
export class TacheDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly tachesService = inject(TachesService);
  private readonly checklistsService = inject(ChecklistsService);
  private readonly authService = inject(AuthService);
  private readonly fallbackId = '1065';
  protected readonly tacheId = computed(() => this.route.snapshot.paramMap.get('id') ?? this.fallbackId);

  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly checklistLoading = signal<Record<number, boolean>>({});

  protected readonly tache = signal<TacheDetailData | null>(null);
  protected readonly isUploadingDocuments = signal(false);
  private readonly fallbackTimeline = [
    { label: 'Création', date: new Date().toISOString() },
  ];

  protected readonly statusBadges: Record<StatutTache, { label: string; classes: string }> = {
    en_attente: { label: 'En attente', classes: 'bg-amber-100 text-amber-700' },
    en_cours: { label: 'En cours', classes: 'bg-emerald-100 text-emerald-700' },
    terminee: { label: 'Terminée', classes: 'bg-slate-200 text-slate-700' },
    annulee: { label: 'Annulée', classes: 'bg-rose-100 text-rose-700' },
  };

  protected readonly commentaireContenu = signal('');
  protected readonly isSubmittingComment = signal(false);

  protected readonly nouveauxDocuments = signal<File[]>([]);
  protected readonly filesBaseUrl = environment.imageBaseUrl || `${environment.apiBaseUrl}/public`;
  protected readonly cameraInput = viewChild<ElementRef<HTMLInputElement>>('cameraInput');
  protected readonly isCapturingPhoto = signal(false);
  protected readonly isCameraModalOpen = signal(false);
  private mediaStream: MediaStream | null = null;
  @ViewChild('videoPreview') private videoPreview?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasPreview') private canvasPreview?: ElementRef<HTMLCanvasElement>;
  private capturedFile: File | null = null;
  protected readonly capturedPreviewUrl = signal<string | null>(null);

  protected isImageDocument(doc: DocumentItem): boolean {
    const type = doc.type_document?.toLowerCase() ?? '';
    const extension = doc.extension?.toLowerCase() ?? '';
    return (
      type.includes('image') ||
      ['jpg', 'jpeg', 'png', 'gif', 'webp'].some((ext) => extension.endsWith(ext))
    );
  }

  protected handleDocumentChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.nouveauxDocuments.set(target.files ? Array.from(target.files) : []);
  }

  protected triggerCameraCapture(): void {
    try {
      // Ouvre la modal caméra (avec getUserMedia)
      this.openCameraModal();
    } catch (error) {
      console.error('[TacheDetail] Erreur lors de l’ouverture de la caméra', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Erreur lors de l’ouverture de la caméra. Veuillez réessayer.'
      );
    }
  }

  protected async openCameraModal(): Promise<void> {
    this.isCameraModalOpen.set(true);
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      const video = this.videoPreview?.nativeElement;
      if (video && this.mediaStream) {
        video.srcObject = this.mediaStream;
        // Attendre les métadonnées pour avoir les dimensions correctes
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };
          video.addEventListener('loadedmetadata', onLoaded);
          video.play().catch(() => resolve());
        });
      }
    } catch (err) {
      console.error('[TacheDetail] getUserMedia a échoué', err);
      this.errorMessage.set('Impossible d’accéder à la caméra. Vérifiez les permissions et utilisez HTTPS.');
      this.isCameraModalOpen.set(false);
    }
  }

  protected closeCameraModal(): void {
    this.stopCameraStream();
    this.isCameraModalOpen.set(false);
    this.capturedFile = null;
    this.capturedPreviewUrl.set(null);
  }

  private stopCameraStream(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    const video = this.videoPreview?.nativeElement;
    if (video) {
      video.srcObject = null;
    }
  }

  protected captureFromCamera(): void {
    const video = this.videoPreview?.nativeElement;
    const canvas = this.canvasPreview?.nativeElement;
    if (!video || !canvas) {
      return;
    }
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const file = this.dataURLtoFile(dataUrl, `photo-${Date.now()}.jpg`);
    this.capturedFile = file;
    this.capturedPreviewUrl.set(dataUrl);
    // Arrête l’aperçu après capture
    this.stopCameraStream();
  }

  protected async retakePhoto(): Promise<void> {
    this.capturedFile = null;
    this.capturedPreviewUrl.set(null);
    await this.openCameraModal();
  }

  private dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1] || '');
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  protected async uploadCapturedPhoto(): Promise<void> {
    const current = this.tache();
    if (!current || !this.capturedFile) {
      return;
    }
    this.isCapturingPhoto.set(true);
    this.errorMessage.set(null);
    try {
      await this.tachesService.uploadDocument(current.id, this.capturedFile, this.capturedFile.name);
      await this.fetchTacheDetail(String(current.id));
      this.closeCameraModal();
    } catch (error) {
      console.error('[TacheDetail] Upload de la photo capturée échoué', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Erreur lors de l’envoi de la photo capturée.'
      );
    } finally {
      this.isCapturingPhoto.set(false);
    }
  }

  protected async handleCameraCapture(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    const current = this.tache();
    if (!current) {
      return;
    }

    this.isCapturingPhoto.set(true);
    this.errorMessage.set(null);

    try {
      await this.tachesService.uploadDocument(current.id, file, file.name);
      console.info(`[TacheDetail] Photo capturée et envoyée pour la tâche #${current.id}`);
      // Réinitialiser l'input pour permettre de prendre une autre photo
      target.value = '';
      // Recharger les détails de la tâche pour afficher la nouvelle photo
      await this.fetchTacheDetail(String(current.id));
    } catch (error) {
      console.error('[TacheDetail] Upload photo échoué', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Erreur lors de l’envoi de la photo.'
      );
    } finally {
      this.isCapturingPhoto.set(false);
    }
  }

  protected updateCommentContent(value: string): void {
    this.commentaireContenu.set(value);
  }

  protected resetCommentForm(): void {
    this.commentaireContenu.set('');
  }

  protected async submitComment(): Promise<void> {
    const content = this.commentaireContenu().trim();
    const current = this.tache();
    const agent = this.authService.currentAgent();

    if (!content || !current || !agent?.id) {
      return;
    }

    this.isSubmittingComment.set(true);
    this.errorMessage.set(null);

    try {
      await this.tachesService.addComment(current.id, {
        contenu: content,
        commentable_type: 'App\\Models\\Agent',
        commentable_id: agent.id,
      });
      console.info(
        `[TacheDetail] Commentaire ajouté sur la tâche #${current.id} par l'agent #${agent.id}`
      );
      this.resetCommentForm();
      await this.fetchTacheDetail(String(current.id));
    } catch (error) {
      console.error('[TacheDetail] Impossible d’ajouter le commentaire', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Erreur lors de l’ajout du commentaire.'
      );
    } finally {
      this.isSubmittingComment.set(false);
    }
  }

  protected resetDocuments(): void {
    this.nouveauxDocuments.set([]);
  }

  protected async uploadDocuments(): Promise<void> {
    const files = this.nouveauxDocuments();
    const current = this.tache();

    if (!files.length || !current) {
      return;
    }

    this.isUploadingDocuments.set(true);
    this.errorMessage.set(null);

    try {
      for (const file of files) {
        await this.tachesService.uploadDocument(current.id, file, file.name);
      }
      console.info(`[TacheDetail] ${files.length} document(s) envoyés pour la tâche #${current.id}`);
      this.resetDocuments();
      await this.fetchTacheDetail(String(current.id));
    } catch (error) {
      console.error('[TacheDetail] Upload documents échoué', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Erreur lors de l’envoi des documents.'
      );
    } finally {
      this.isUploadingDocuments.set(false);
    }
  }

  protected async toggleChecklistItem(id: number, termine: boolean): Promise<void> {
    const current = this.tache();
    if (!current) {
      return;
    }

    const previous = current.checklists.map((item) => ({ ...item }));
    this.setChecklistLoading(id, true);

    this.tache.set({
      ...current,
      checklists: current.checklists.map((item) =>
        item.id === id ? { ...item, termine } : item
      ),
    });

    try {
      if (termine) {
        await this.checklistsService.markComplete(id);
      } else {
        await this.checklistsService.markIncomplete(id);
      }
    } catch (error) {
      console.error('[TacheDetail] Impossible de mettre à jour la checklist', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la checklist.'
      );
      const currentTache = this.tache();
      if (currentTache) {
        this.tache.set({
          ...currentTache,
          checklists: previous,
        });
      }
    } finally {
      this.setChecklistLoading(id, false);
    }
  }

  constructor() {
    effect(() => {
      const id = this.tacheId();
      this.fetchTacheDetail(id);
    });
  }

  private async fetchTacheDetail(id: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const apiData = await this.tachesService.getTacheDetail<any>(id);
      const mapped = this.mapTacheDetail(apiData, id);
      this.tache.set(mapped);
      console.info(`[TacheDetail] Tâche reçue #${mapped.id}`, mapped);
    } catch (error) {
      console.error('[TacheDetail] Impossible de charger la tâche', error);
      this.errorMessage.set(error instanceof Error ? error.message : 'Erreur inattendue.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private mapTacheDetail(data: any, fallbackId: string): TacheDetailData {
    const entreprise = data?.entreprise ?? {};
    const client = data?.client ?? {};

    const documents: DocumentItem[] = Array.isArray(data?.documents)
      ? data.documents.map((doc: any) => ({
          id: doc.id ?? 0,
          type_document: doc.type_document ?? 'document',
          description: doc.description ?? doc.type_document ?? 'Document',
          url: this.buildPublicUrl(doc.url ?? doc.chemin_fichier ?? ''),
          extension: doc.extension ?? '',
          created_at: doc.created_at ?? new Date().toISOString(),
        }))
      : [];

    const checklists: ChecklistItem[] = Array.isArray(data?.checklists)
      ? data.checklists.map((item: any, index: number) => ({
          id: item.id ?? index,
          titre: item.titre ?? 'Étape',
          description: item.description ?? '',
          termine: Boolean(item.termine),
          ordre: item.ordre ?? index + 1,
        }))
      : [];

    const commentaires: CommentaireItem[] = Array.isArray(data?.commentaires)
      ? data.commentaires.map((comm: any, index: number) => ({
          id: comm.id ?? index,
          auteur: comm.auteur ?? comm.commentable?.nom ?? 'Auteur inconnu',
          role: comm.role ?? 'agent',
          contenu: comm.contenu ?? '',
          created_at: comm.created_at ?? new Date().toISOString(),
        }))
      : [];

    const agents = Array.isArray(data?.agents)
      ? data.agents.map((agent: any) => ({
          id: agent.id ?? 0,
          nom: agent.nom ?? `${agent.prenom ?? 'Agent'} ${agent.nom ?? ''}`.trim(),
          role: agent.pivot?.role ?? 'agent',
        }))
      : [];

    const employers = Array.isArray(data?.employers)
      ? data.employers.map((employer: any) => ({
          id: employer.id ?? 0,
          nom: employer.nom ?? `${employer.prenom ?? ''} ${employer.nom ?? ''}`.trim(),
          poste: employer.poste ?? 'Employé',
        }))
      : [];

    const timeline = [
      data?.created_at && { label: 'Création', date: data.created_at },
      data?.date_debut && { label: 'Début prévu', date: data.date_debut },
      data?.updated_at && { label: 'Dernière mise à jour', date: data.updated_at },
    ].filter(Boolean) as Array<{ label: string; date: string }>;

    return {
      id: data?.id ?? Number(fallbackId),
      titre: data?.titre ?? 'Tâche sans titre',
      description: data?.description ?? 'Aucune description fournie.',
      statut: data?.statut ?? 'en_attente',
      priorite: data?.priorite ?? 'normale',
      adresse: data?.adresse ?? 'Adresse non renseignée',
      ville: data?.ville ?? 'Ville non renseignée',
      date_debut: data?.date_debut ?? new Date().toISOString(),
      date_fin_prevue: data?.date_fin ?? data?.date_fin_prevue ?? new Date().toISOString(),
      date_fin_reelle: data?.date_fin_reelle ?? null,
      entreprise: {
        id: entreprise.id ?? 0,
        nom: entreprise.nom ?? 'Entreprise inconnue',
        telephone: entreprise.telephone ?? 'N/A',
      },
      client: {
        id: client.id ?? 0,
        nom: client.nom ?? 'Client inconnu',
        contact: client.telephone ?? client.contact ?? 'N/A',
        email: client.email ?? 'N/A',
      },
      agents,
      employers,
      cout_estimatif: data?.cout_estimatif ?? 0,
      documents,
      checklists,
      commentaires,
      timeline: timeline.length ? timeline : this.fallbackTimeline,
    };
  }

  private buildPublicUrl(path: string): string {
    if (!path) {
      return '';
    }

    return path.startsWith('http') ? path : `${this.filesBaseUrl}/${path}`.replace(/([^:]\/)\/+/g, '$1');
  }

  private setChecklistLoading(id: number, loading: boolean): void {
    this.checklistLoading.update((state) => ({
      ...state,
      [id]: loading,
    }));
  }
}
