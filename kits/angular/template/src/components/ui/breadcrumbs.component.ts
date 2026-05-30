import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'l-breadcrumbs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="l-breadcrumbs">
      <ng-container *ngFor="let item of items; let last = last">
        <span [class]="last ? 'l-breadcrumb-item l-breadcrumb-active' : 'l-breadcrumb-item'">
          {{ item }}
        </span>
        <span *ngIf="!last" class="l-breadcrumb-sep">{{ separator }}</span>
      </ng-container>
    </nav>
  `,
})
export class BreadcrumbsComponent {
  @Input() items: string[] = [];
  @Input() separator = '/';
}
