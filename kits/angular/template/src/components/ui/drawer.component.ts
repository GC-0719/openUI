import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="ou-drawer-overlay" (click)="closeOnOverlay && close.emit()">
      <div
        [class]="'ou-drawer ou-drawer-' + position"
        (click)="$event.stopPropagation()"
      >
        <div class="ou-drawer-header">
          <span class="ou-drawer-title">{{ title }}</span>
          <button class="ou-modal-close" (click)="close.emit()">✕</button>
        </div>
        <div class="ou-drawer-body">
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
