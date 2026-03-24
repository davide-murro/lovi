import { Component, effect, ElementRef, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-dialog',
  imports: [],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss'
})
export class Dialog {
  dialogService = inject(DialogService);
  private elementRef = inject(ElementRef);

  @ViewChild('componentContainer', { read: ViewContainerRef, static: true })
  componentContainer!: ViewContainerRef;

  private isMouseDownOnBackdrop = false;

  constructor() {
    // React to signal changes
    effect(() => {
      const { component, config, visible } = this.dialogService.dialog();
      this.componentContainer.clear();

      if (visible && component) {
        const ref = this.componentContainer.createComponent(component);
        if (config?.data) {
          for (const key of Object.keys(config.data)) {
            ref.setInput(key, config.data[key]);
          }
        }
        if (config?.title && 'title' in ref.instance) {
          ref.setInput('title', config.title);
        }

        setTimeout(() => {
          const autofocusElement = this.elementRef.nativeElement.querySelector('[autofocus]');
          autofocusElement?.focus();
        }, 0);
      }
    });
  }

  onMouseDown(event: MouseEvent) {
    // Check if the click started on the backdrop
    this.isMouseDownOnBackdrop = event.target === event.currentTarget;
  }

  onMouseUp(event: MouseEvent) {
    // Only close if it started and ended on the backdrop
    if (this.isMouseDownOnBackdrop && event.target === event.currentTarget) {
      this.dialogService.close(null);
    }
    this.isMouseDownOnBackdrop = false;
  }
}
