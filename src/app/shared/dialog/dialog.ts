import { Component, effect, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-dialog',
  imports: [],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss'
})
export class Dialog {
  dialogService = inject(DialogService);

  @ViewChild('componentContainer', { read: ViewContainerRef, static: true })
  componentContainer!: ViewContainerRef;

  constructor() {
    // React to signal changes
    effect(() => {
      const { component, config, visible } = this.dialogService.dialog();
      this.componentContainer.clear();

      if (visible && component) {
        const ref = this.componentContainer.createComponent(component);
        if (config?.data) Object.assign(ref.instance, config.data);
        if (config?.title && 'title' in ref.instance) {
          (ref.instance as any).title = config.title;
        }
      }
    });
  }

  onBackdropClick(event: MouseEvent) {
    // close when clicking outside
    this.dialogService.close(null);
  }
}
