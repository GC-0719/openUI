import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-list',
  standalone: true,
  imports: [CommonModule],
  template: `<ul class="l-list"><ng-content></ng-content></ul>`,
})
export class ListComponent {}

@Component({
  selector: 'l-list-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <li [class]="'l-list-item' + (active ? ' l-list-item-active' : '')">
      <ng-content></ng-content>
    </li>
  `,
})
export class ListItemComponent {
  @Input() active = false;
}
