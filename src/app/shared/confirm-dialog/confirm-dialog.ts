import { Component, inject, Input } from '@angular/core';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {
  dialogService = inject(DialogService);

  @Input() title = '';
  @Input() message = '';

  confirm(result: boolean) {
    this.dialogService.close(result);
  }
}
