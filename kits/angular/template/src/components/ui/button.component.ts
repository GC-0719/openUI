import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="'ou-btn ou-btn-' + variant + ' ou-btn-' + size"
      [disabled]="disabled || loading"
      [attr.type]="type"
      [attr.aria-busy]="loading || null"
      [attr.aria-disabled]="disabled || loading || null"
    >
      <span *ngIf="loading" class="ou-sr-only">Loading</span>
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
}
