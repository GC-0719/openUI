import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'ou-chip ou-chip-' + variant">
      <ng-content></ng-content>
      <button *ngIf="removable" class="ou-chip-remove" (click)="remove.emit()">✕</button>
    </span>
  `,
})
export class ChipComponent {
  @Input() variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';
  @Input() removable = false;
  @Output() remove = new EventEmitter<void>();
}
