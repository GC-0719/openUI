import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="l-dropdown-wrap" style="position:relative;display:inline-flex">
      <div (click)="open = !open">
        <ng-content select="[trigger]"></ng-content>
      </div>
      <div
        *ngIf="open"
        [class]="'l-dropdown-menu l-dropdown-' + align"
        style="position:absolute;top:calc(100% + 6px);z-index:100"
        [style.right]="align === 'right' ? '0' : 'auto'"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class DropdownComponent {
  @Input() align: 'left' | 'right' = 'left';
  open = false;

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (!this.el.nativeElement.contains(e.target)) this.open = false;
  }

  constructor(private el: ElementRef) {}
}

@Component({
  selector: 'l-dropdown-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [class]="'l-dropdown-item' + (danger ? ' danger' : '')">
      <ng-content></ng-content>
    </button>
  `,
})
export class DropdownItemComponent {
  @Input() danger = false;
}

@Component({
  selector: 'l-dropdown-divider',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="l-dropdown-divider"></div>`,
})
export class DropdownDividerComponent {}
