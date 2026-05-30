import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'l-avatar l-avatar-' + size + (ring ? ' l-avatar-ring' : '')">
      <img *ngIf="src" [src]="src" [alt]="alt" />
      <span *ngIf="!src">{{ initials }}</span>
    </div>
  `,
})
export class AvatarComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() initials = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() ring = false;
}
