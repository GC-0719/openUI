import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

let nextModalTitleId = 0;

@Component({
  selector: 'ou-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="visible"
      class="ou-modal-overlay"
      role="presentation"
      (click)="closeOnOverlay && close.emit()"
    >
      <div
        #panel
        [class]="'ou-modal ou-modal-' + size"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title ? titleId : null"
        tabindex="-1"
        (click)="$event.stopPropagation()"
      >
        <div class="ou-modal-header">
          <span *ngIf="title" [id]="titleId" class="ou-modal-title">{{ title }}</span>
          <button type="button" class="ou-modal-close" aria-label="Close dialog" (click)="close.emit()">
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div class="ou-modal-body">
          <ng-content></ng-content>
        </div>
        <div class="ou-modal-footer">
          <ng-content select="[footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent implements OnChanges {
  @Input() open = false;
  @Input() isOpen?: boolean;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() closeOnOverlay = true;
  @Output() close = new EventEmitter<void>();

  @ViewChild('panel') panel?: ElementRef<HTMLElement>;

  readonly titleId = `ou-modal-title-${++nextModalTitleId}`;

  get visible(): boolean {
    return this.open || this.isOpen === true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('isOpen' in changes && changes['isOpen'].currentValue !== undefined) {
      this.open = !!changes['isOpen'].currentValue;
    }
    if (this.visible) {
      queueMicrotask(() => this.focusPanel());
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.visible) this.close.emit();
  }

  private focusPanel() {
    const el = this.panel?.nativeElement;
    if (!el) return;
    const focusable = el.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    (focusable ?? el).focus();
  }
}
