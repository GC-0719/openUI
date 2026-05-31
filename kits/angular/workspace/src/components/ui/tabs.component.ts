import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ou-tabs">
      <div class="ou-tabs-list">
        <button
          *ngFor="let tab of tabs"
          [class]="'ou-tab' + (active === tab ? ' ou-tab-active' : '')"
          (click)="active = tab; activeChange.emit(tab)"
        >{{ tab }}</button>
      </div>
    </div>
  `,
})
export class TabsComponent {
  @Input() tabs: string[] = [];
  @Input() active = '';
  @Output() activeChange = new EventEmitter<string>();
}
