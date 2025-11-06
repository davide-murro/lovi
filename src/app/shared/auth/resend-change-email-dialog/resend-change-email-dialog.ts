import { Component, inject, Input, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { ResendConfirmEmailDto } from '../../../core/models/dtos/auth/resend-confirm-email-dto.model';

@Component({
  selector: 'app-resend-change-email-dialog',
  imports: [],
  templateUrl: './resend-change-email-dialog.html',
  styleUrl: './resend-change-email-dialog.scss'
})
export class ResendChangeEmailDialog {
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);

  @Input() email = null!;

  isLoading = signal(false);
  submit() {
    let resendDto: ResendConfirmEmailDto = {
      email: this.email,
    };
    this.authService.resendConfirmEmail(resendDto).subscribe({
      next: () => {
        this.dialogService.close(true);
        this.toasterService.show($localize`Confirmation email resent!`, { type: 'success' });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('authService.resendConfirmEmail', resendDto, err);
        this.toasterService.show(
          $localize`Confirmation email resending failed`,
          { type: 'error' }
        );
        this.isLoading.set(false);
      }
    });
  }

  cancel() {
    this.dialogService.close();
  }
}
