import { Component, inject, input } from '@angular/core';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-log-dialog',
  imports: [],
  templateUrl: './log-dialog.html',
  styleUrl: './log-dialog.scss'
})
export class LogDialog {
  dialogService = inject(DialogService);

  readonly title = input.required<string>();
  readonly message = input.required<string>();

  ok(result: boolean) {
    this.dialogService.close(result);
  }
}
