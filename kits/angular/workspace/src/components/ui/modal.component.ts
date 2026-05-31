import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="ou-modal-overlay" (click)="closeOnOverlay && close.emit()">
      <div [class]="'ou-modal ou-modal-' + size" (click)="$event.stopPropagation()">
        <div class="ou-modal-header">
          <span class="ou-modal-title">{{ title }}</span>
          <button class="ou-modal-close" (click)="close.emit()">✕</button>
        </div>
        <div class="ou-modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() closeOnOverlay = true;
  @Output() close = new EventEmitter<void>();
}
