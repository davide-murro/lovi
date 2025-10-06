import { Injectable, signal } from '@angular/core';
import { Toast } from '../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  toasts = signal<Toast[]>([]);
  idCounter = signal<number>(0);

  show(message: string, options: Partial<Omit<Toast, 'id'>> = {}) {
    const idCounter = this.idCounter() + 1;
    const toast: Toast = {
      id: idCounter,
      message,
      type: options.type ?? 'info',
      duration: options.duration ?? 3000
    };

    this.idCounter.set(idCounter);
    this.toasts.update((list) => [...list, toast]);

    // auto remove after duration
    setTimeout(() => this.dismiss(idCounter), toast.duration);
  }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clearAll() {
    this.toasts.set([]);
  }
}
