import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!dismissed" [class]="'l-alert l-alert-' + variant">
      <span *ngIf="title" class="l-alert-title">{{ title }}</span>
      <span class="l-alert-msg"><ng-content></ng-content></span>
      <button *ngIf="dismissible" class="l-alert-close" (click)="dismiss()">✕</button>
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
