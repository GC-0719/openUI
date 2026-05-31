import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-list',
  standalone: true,
  imports: [CommonModule],
  template: `<ul class="ou-list"><ng-content></ng-content></ul>`,
})
export class ListComponent {}

@Component({
  selector: 'ou-list-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <li [class]="'ou-list-item' + (active ? ' ou-list-item-active' : '')">
      <ng-content></ng-content>
    </li>
  `,
})
export class ListItemComponent {
  @Input() active = false;
}
