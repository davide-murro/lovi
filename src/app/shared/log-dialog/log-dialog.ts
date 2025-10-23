import { Component, inject, input, Input } from '@angular/core';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-log-dialog',
  imports: [],
  templateUrl: './log-dialog.html',
  styleUrl: './log-dialog.scss'
})
export class LogDialog {
  dialogService = inject(DialogService);

  @Input() title = '';
  @Input() message = '';

  ok(result: boolean) {
    this.dialogService.close(result);
  }
}
