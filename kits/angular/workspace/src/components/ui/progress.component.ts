import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ou-progress">
      <div [class]="'ou-progress-bar' + (striped ? ' ou-progress-bar-striped' : '')" [style.width.%]="value"></div>
    </div>
    <span *ngIf="showLabel" class="ou-progress-label">{{ value }}%</span>
  `,
})
export class ProgressComponent {
  @Input() value = 0;
  @Input() showLabel = false;
  @Input() striped = false;
}
