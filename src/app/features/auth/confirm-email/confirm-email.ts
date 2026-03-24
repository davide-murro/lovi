import { Component, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ConfirmEmailDto } from '../../../core/models/dtos/auth/confirm-email-dto.model';

@Component({
  selector: 'app-confirm-email',
  imports: [ReactiveFormsModule],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.scss'
})
export class ConfirmEmail {
  private router = inject(Router);
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);

  userId = input.required<string>();
  token = input.required<string>();

  isLoading = signal(false);
  onSubmit(): void {
    let dto: ConfirmEmailDto = {
      userId: this.userId(),
      token: this.token()
    }
    this.isLoading.set(true);
    this.authService.confirmEmail(dto).subscribe({
      next: () => {
        this.dialogService.log(
          $localize`Email confirmed`,
          $localize`You can now login into LOVI with the email and the password you chose during the registration.`,
        ).subscribe(() => this.router.navigate(['/auth', 'login']));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('authService.confirmEmail', dto, error);
        if ((Array.isArray(error.error) && error.error.some((e: any) => e.code === 'EmailAlreadyConfirmed'))) {
          this.dialogService.log(
            $localize`Email already confirmed`,
            $localize`You can login into LOVI with the email and the password you chose during the registration.`
          ).subscribe(() => this.router.navigate(['/auth', 'login']));
        } else {
          this.dialogService.log(
            $localize`Email confirmation failed`,
            $localize`Email confirmation failed, unexpected error.`,
            { type: 'error' }
          );
        }
        this.isLoading.set(false);
      }
    });
  }
}
