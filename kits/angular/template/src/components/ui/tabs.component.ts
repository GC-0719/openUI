import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="l-tabs">
      <div class="l-tabs-list">
        <button
          *ngFor="let tab of tabs"
          [class]="'l-tab' + (active === tab ? ' l-tab-active' : '')"
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
