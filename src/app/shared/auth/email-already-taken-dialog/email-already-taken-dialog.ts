import { Component, inject, Input, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { ResendConfirmEmailDto } from '../../../core/models/dtos/auth/resend-confirm-email-dto.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-email-already-taken-dialog',
  imports: [RouterLink],
  templateUrl: './email-already-taken-dialog.html',
  styleUrl: './email-already-taken-dialog.scss'
})
export class EmailAlreadyTakenDialog {
  private dialogService = inject(DialogService);

  @Input() email = null!;

  cancel() {
    this.dialogService.close();
  }
}
