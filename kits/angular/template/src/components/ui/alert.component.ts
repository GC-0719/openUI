import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!dismissed" [class]="'ou-alert ou-alert-' + variant">
      <span *ngIf="title" class="ou-alert-title">{{ title }}</span>
      <span class="ou-alert-msg"><ng-content></ng-content></span>
      <button *ngIf="dismissible" class="ou-alert-close" (click)="dismiss()">✕</button>
    </div>
  `,
})
export class AlertComponent {
  @Input() variant: 'info' | 'success' | 'warning' | 'danger' = 'info';
  @Input() title = '';
  @Input() dismissible = false;
  @Output() dismissed$ = new EventEmitter<void>();

  dismissed = false;
  dismiss() { this.dismissed = true; this.dismissed$.emit(); }
}
