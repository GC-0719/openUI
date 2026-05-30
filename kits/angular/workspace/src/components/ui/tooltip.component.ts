import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="l-tooltip-wrap">
      <ng-content></ng-content>
      <span [class]="'l-tooltip l-tooltip-' + position">{{ text }}</span>
    </span>
  `,
  styles: [`:host { display: inline-block; }`],
})
export class TooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
}
