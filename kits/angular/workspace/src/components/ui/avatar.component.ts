import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'ou-avatar ou-avatar-' + size + (ring ? ' ou-avatar-ring' : '')">
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
