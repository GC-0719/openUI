import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'l-card' + (hover ? ' l-card-hover' : '') + (glass ? ' l-card-glass' : '')">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  @Input() hover = false;
  @Input() glass = false;
}
