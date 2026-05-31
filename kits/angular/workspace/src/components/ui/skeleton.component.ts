import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="ou-skeleton"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="radius"
    ></div>
  `,
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() radius = '6px';
}
