import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'ou-toast-provider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-content></ng-content>
    <div class="ou-toast-container">
      <div
        *ngFor="let t of toastService.toasts()"
        [class]="'ou-toast ou-toast-' + t.variant"
      >
        <div *ngIf="t.title" class="ou-toast-title">{{ t.title }}</div>
        <div *ngIf="t.message" class="ou-toast-msg">{{ t.message }}</div>
        <button class="ou-toast-close" (click)="toastService.remove(t.id)">✕</button>
      </div>
    </div>
  `,
})
export class ToastProviderComponent {
  toastService = inject(ToastService);
}
