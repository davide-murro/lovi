import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-email-already-taken-dialog',
  imports: [RouterLink],
  templateUrl: './email-already-taken-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './email-already-taken-dialog.scss'
})
export class EmailAlreadyTakenDialog {
  private dialogService = inject(DialogService);

  readonly email = input.required<string>();

  cancel() {
    this.dialogService.close();
  }
}
