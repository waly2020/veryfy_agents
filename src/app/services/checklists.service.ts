import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface ChecklistResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  async markComplete(id: number): Promise<ChecklistResponse> {
    return this.patchChecklist(`${this.baseUrl}/checklists/${id}/complete`);
  }

  async markIncomplete(id: number): Promise<ChecklistResponse> {
    return this.patchChecklist(`${this.baseUrl}/checklists/${id}/incomplete`);
  }

  private async patchChecklist(endpoint: string): Promise<ChecklistResponse> {
    try {
      return await lastValueFrom(this.http.patch<ChecklistResponse>(endpoint, {}));
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
      if (
        inner &&
        typeof inner === 'object' &&
        'message' in inner &&
        typeof (inner as { message?: string }).message === 'string'
      ) {
        return (inner as { message?: string }).message as string;
      }
    }

    return 'Impossible de mettre à jour la checklist.';
  }
}

