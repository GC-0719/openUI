import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'l-toast-provider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-content></ng-content>
    <div class="l-toast-container">
      <div
        *ngFor="let t of toastService.toasts()"
        [class]="'l-toast l-toast-' + t.variant"
      >
        <div *ngIf="t.title" class="l-toast-title">{{ t.title }}</div>
        <div *ngIf="t.message" class="l-toast-msg">{{ t.message }}</div>
        <button class="l-toast-close" (click)="toastService.remove(t.id)">✕</button>
      </div>
    </div>
  `,
})
export class ToastProviderComponent {
  toastService = inject(ToastService);
}
