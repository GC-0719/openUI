import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'ou-card' + (hover ? ' ou-card-hover' : '') + (glass ? ' ou-card-glass' : '')">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  @Input() hover = false;
  @Input() glass = false;
}
