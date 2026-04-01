import { Component, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ConfirmChangeEmailDto } from '../../../core/models/dtos/auth/confirm-change-email-dto.model';

@Component({
  selector: 'app-confirm-change-email',
  imports: [ReactiveFormsModule],
  templateUrl: './confirm-change-email.html',
  styleUrl: './confirm-change-email.scss'
})
export class ConfirmChangeEmail {
  private router = inject(Router);
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);

  userId = input.required<string>();
  newEmail = input.required<string>();
  token = input.required<string>();

  isLoading = signal(false);
  onSubmit(): void {
    let dto: ConfirmChangeEmailDto = {
      userId: this.userId(),
      newEmail: this.newEmail(),
      token: this.token()
    }
    this.isLoading.set(true);
    this.authService.confirmChangeEmail(dto).subscribe({
      next: () => {
        this.dialogService.log(
          $localize`Changing email confirmed`,
          $localize`You can now login into LOVI with the new mail you chose and the old password.`,
        ).subscribe(() => this.router.navigate(['/auth', 'login']));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('authService.confirmChangeEmail', dto, error);
        this.dialogService.log(
          $localize`Changing email confirmation failed`,
          $localize`Changing email confirmation failed, unexpected error.`,
          { type: 'error' }
        );
        this.isLoading.set(false);
      }
    });
  }
}
