import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span [class]="'l-badge l-badge-' + variant"><ng-content></ng-content></span>`,
})
export class BadgeComponent {
  @Input() variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';
}
