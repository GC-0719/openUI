import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="l-modal-overlay" (click)="closeOnOverlay && close.emit()">
      <div [class]="'l-modal l-modal-' + size" (click)="$event.stopPropagation()">
        <div class="l-modal-header">
          <span class="l-modal-title">{{ title }}</span>
          <button class="l-modal-close" (click)="close.emit()">✕</button>
        </div>
        <div class="l-modal-body">
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
