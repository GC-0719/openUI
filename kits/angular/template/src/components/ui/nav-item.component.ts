import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-nav-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="'l-nav-item' + (active ? ' l-nav-item-active' : '')"
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
