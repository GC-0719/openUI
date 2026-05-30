import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="l-drawer-overlay" (click)="closeOnOverlay && close.emit()">
      <div
        [class]="'l-drawer l-drawer-' + position"
        (click)="$event.stopPropagation()"
      >
        <div class="l-drawer-header">
          <span class="l-drawer-title">{{ title }}</span>
          <button class="l-modal-close" (click)="close.emit()">✕</button>
        </div>
        <div class="l-drawer-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class DrawerComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() position: 'right' | 'left' = 'right';
  @Input() closeOnOverlay = true;
  @Output() close = new EventEmitter<void>();
}
