import { Component, inject, input } from '@angular/core';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {
  dialogService = inject(DialogService);

  readonly title = input.required<string>();
  readonly message = input.required<string>();

  confirm(result: boolean) {
    this.dialogService.close(result);
  }
}
