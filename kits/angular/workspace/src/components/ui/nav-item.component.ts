import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-nav-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="'ou-nav-item' + (active ? ' ou-nav-item-active' : '')"
      (click)="click.emit()"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class NavItemComponent {
  @Input() active = false;
  @Output() click = new EventEmitter<void>();
}
