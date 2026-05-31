import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AccordionItem {
  title: string;
  content: string;
}

@Component({
  selector: 'ou-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ou-accordion">
      <div *ngFor="let item of items; let i = index" class="ou-accordion-item">
        <button
          class="ou-accordion-trigger"
          (click)="toggle(i)"
          [attr.aria-expanded]="openIndex === i"
        >
          {{ item.title }}
          <span class="ou-accordion-icon">{{ openIndex === i ? '−' : '+' }}</span>
        </button>
        <div *ngIf="openIndex === i" class="ou-accordion-content">
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
