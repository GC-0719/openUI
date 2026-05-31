import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="ou-tooltip-wrap">
      <ng-content></ng-content>
      <span [class]="'ou-tooltip ou-tooltip-' + position">{{ text }}</span>
    </span>
  `,
  styles: [`:host { display: inline-block; }`],
})
export class TooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
}
