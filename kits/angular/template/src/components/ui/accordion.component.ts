import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AccordionItem {
  title: string;
  content: string;
}

@Component({
  selector: 'l-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="l-accordion">
      <div *ngFor="let item of items; let i = index" class="l-accordion-item">
        <button
          class="l-accordion-trigger"
          (click)="toggle(i)"
          [attr.aria-expanded]="openIndex === i"
        >
          {{ item.title }}
          <span class="l-accordion-icon">{{ openIndex === i ? '−' : '+' }}</span>
        </button>
        <div *ngIf="openIndex === i" class="l-accordion-content">
          <p>{{ item.content }}</p>
        </div>
      </div>
    </div>
  `,
})
export class AccordionComponent {
  @Input() items: AccordionItem[] = [];
  openIndex = -1;
  toggle(i: number) { this.openIndex = this.openIndex === i ? -1 : i; }
}
