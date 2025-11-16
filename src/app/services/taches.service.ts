import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface TacheDetailApiResponse<T> {
  success?: boolean;
  data: T;
}

interface CommentPayload {
  contenu: string;
  commentable_type: string;
  commentable_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class TachesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  async getTacheDetail<T = unknown>(tacheId: string | number): Promise<T> {
    const endpoint = `${this.baseUrl}/taches/${tacheId}`;

    try {
      const response = await lastValueFrom(
        this.http.get<TacheDetailApiResponse<T>>(endpoint)
      );

      return response.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateChecklistStatus(checklistId: number, termine: boolean): Promise<void> {
    const action = termine ? 'complete' : 'incomplete';
    const endpoint = `${this.baseUrl}/checklists/${checklistId}/${action}`;

    try {
      await lastValueFrom(this.http.patch(endpoint, {}));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async uploadDocument(
    tacheId: string | number,
    file: File,
    description?: string
  ): Promise<void> {
    const endpoint = `${this.baseUrl}/taches/${tacheId}/documents`;
    const formData = new FormData();
    formData.append('document', file);
    if (description) {
      formData.append('description', description);
    }

    try {
      await lastValueFrom(this.http.post(endpoint, formData));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async addComment(
    tacheId: string | number,
    payload: CommentPayload
  ): Promise<void> {
    const endpoint = `${this.baseUrl}/commentaires/tache/${tacheId}`;

    try {
      await lastValueFrom(this.http.post(endpoint, payload));
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

    return 'Impossible de récupérer les détails de la tâche.';
  }
}

