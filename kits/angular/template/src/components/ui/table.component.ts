import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
}

@Component({
  selector: 'ou-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ou-table-wrap">
      <table class="ou-table">
        <caption *ngIf="caption">{{ caption }}</caption>
        <thead *ngIf="columns.length">
          <tr>
            <th *ngFor="let col of columns" scope="col">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <ng-content></ng-content>
        </tbody>
      </table>
    </div>
  `,
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() caption = '';
}
