import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ou-breadcrumbs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="ou-breadcrumbs">
      <ng-container *ngFor="let item of items; let last = last">
        <span [class]="last ? 'ou-breadcrumb-item ou-breadcrumb-active' : 'ou-breadcrumb-item'">
          {{ item }}
        </span>
        <span *ngIf="!last" class="ou-breadcrumb-sep">{{ separator }}</span>
      </ng-container>
    </nav>
  `,
})
export class BreadcrumbsComponent {
  @Input() items: string[] = [];
  @Input() separator = '/';
}
