import { Component, inject, signal, input } from '@angular/core';
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

  readonly email = input.required<string>();

  isLoading = signal(false);
  submit() {
    let resendDto: ResendConfirmEmailDto = {
      email: this.email(),
    };
    this.isLoading.set(true);
    this.authService.resendConfirmEmail(resendDto).subscribe({
      next: () => {
        this.dialogService.close(true);
        this.toasterService.show($localize`Confirmation email resent!`, { type: 'success' });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('authService.resendConfirmEmail', resendDto, err);
        if ((Array.isArray(err.error) && err.error.some((e: any) => e.code === 'EmailAlreadyConfirmed'))) {
          this.dialogService.log(
            $localize`Email already confirmed`,
            $localize`You can log in to LOVI with the email and password you chose during registration.`
          ).subscribe(() => this.dialogService.close(true));
        } else {
          this.toasterService.show(
            $localize`Confirmation email resending failed`,
            { type: 'error' }
          );
        }
        this.isLoading.set(false);
      }
    });
  }

  cancel() {
    this.dialogService.close();
  }
}
