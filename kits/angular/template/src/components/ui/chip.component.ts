import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'l-chip l-chip-' + variant">
      <ng-content></ng-content>
      <button *ngIf="removable" class="l-chip-remove" (click)="remove.emit()">✕</button>
    </span>
  `,
})
export class ChipComponent {
  @Input() variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';
  @Input() removable = false;
  @Output() remove = new EventEmitter<void>();
}
