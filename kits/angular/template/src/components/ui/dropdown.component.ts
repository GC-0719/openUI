import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

let nextMenuId = 0;

@Component({
  selector: 'ou-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ou-dropdown-wrap" style="position:relative;display:inline-flex">
      <div
        class="ou-dropdown-trigger"
        role="button"
        tabindex="0"
        [attr.aria-haspopup]="'menu'"
        [attr.aria-expanded]="open"
        [attr.aria-controls]="menuId"
        (click)="toggle()"
        (keydown.enter)="toggle()"
        (keydown.space)="$event.preventDefault(); toggle()"
      >
        <ng-content select="[trigger]"></ng-content>
      </div>
      <div
        *ngIf="open"
        [id]="menuId"
        role="menu"
        [class]="'ou-dropdown-menu ou-dropdown-' + align"
        style="position:absolute;top:calc(100% + 6px);z-index:9999"
        [style.right]="align === 'right' ? '0' : 'auto'"
        [style.left]="align === 'left' ? '0' : 'auto'"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class DropdownComponent {
  @Input() align: 'left' | 'right' | 'center' = 'left';
  open = false;
  readonly menuId = `ou-dropdown-menu-${++nextMenuId}`;

  constructor(private el: ElementRef<HTMLElement>) {}

  toggle() {
    this.open = !this.open;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (!this.el.nativeElement.contains(e.target as Node)) this.open = false;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.open = false;
  }
}

@Component({
  selector: 'ou-dropdown-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      role="menuitem"
      [class]="'ou-dropdown-item' + (danger ? ' danger' : '')"
      [disabled]="disabled"
      (click)="onSelect($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class DropdownItemComponent {
  @Input() danger = false;
  @Input() disabled = false;
  @Output() select = new EventEmitter<void>();

  onSelect(e: Event) {
    if (this.disabled) return;
    e.stopPropagation();
    this.select.emit();
  }
}

@Component({
  selector: 'ou-dropdown-divider',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="ou-dropdown-divider" role="separator"></div>`,
})
export class DropdownDividerComponent {}
