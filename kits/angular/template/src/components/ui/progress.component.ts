import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="l-progress">
      <div [class]="'l-progress-bar' + (striped ? ' l-progress-bar-striped' : '')" [style.width.%]="value"></div>
    </div>
    <span *ngIf="showLabel" class="l-progress-label">{{ value }}%</span>
  `,
})
export class ProgressComponent {
  @Input() value = 0;
  @Input() showLabel = false;
  @Input() striped = false;
}
