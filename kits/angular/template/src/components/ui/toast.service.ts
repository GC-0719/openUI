import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  title: string;
  message?: string;
  variant: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _id = 0;
  toasts = signal<Toast[]>([]);

  add(toast: Omit<Toast, 'id'>) {
    const id = ++this._id;
    this.toasts.update(t => [...t, { ...toast, id }]);
    setTimeout(() => this.remove(id), 3500);
  }

  remove(id: number) {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
