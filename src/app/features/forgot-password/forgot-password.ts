import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DialogService } from '../../core/services/dialog.service';
import { ForgotPasswordDto } from '../../core/models/dtos/forgot-password-dto.model';
import { ToasterService } from '../../core/services/toaster.service';
import { valuesMatchValidator } from '../../core/validators/values-match-validator';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { passwordValidator } from '../../core/validators/password-validator';
import { ResetPasswordDto } from '../../core/models/dtos/reset-password-dto.model';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  private authService = inject(AuthService);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = toSignal(this.route.queryParams.pipe(map(data => data['email'])));
  token = toSignal(this.route.queryParams.pipe(map(data => data['token'])));

  forgotForm = new FormGroup({
    email: new FormControl(this.email(), [Validators.required, Validators.email]),
  });

  resetForm = new FormGroup({
    email: new FormControl({ value: this.email(), disabled: true }),
    newPassword: new FormControl(null, [Validators.required, passwordValidator]),
    newPasswordRepeat: new FormControl(null, Validators.required),
  }, { validators: valuesMatchValidator(['newPassword', 'newPasswordRepeat']) });

  onForgotSubmit(): void {
    if (!this.forgotForm.valid) return;

    let dto: ForgotPasswordDto = {
      email: this.forgotForm.value.email!
    }
    this.authService.forgotPassword(dto).subscribe({
      next: () => {
        this.dialogService.log(
          'Password Reset Link Sent',
          `If an account exists for ${dto.email}, a password reset link has been sent to your inbox. In case, check your spam folder.`,
        ).subscribe(() => this.router.navigate(['/login']));
      },
      error: (error) => {
        console.error('authService.forgotPassword', dto, error);
        this.dialogService.log(
          'Forgot password process error',
          'Unable to reset password. The email could not be processed',
          { type: 'error' }
        ).subscribe();
      }
    });
  }

  onResetSubmit(): void {
    if (!this.resetForm.valid) return;

    let dto: ResetPasswordDto = {
      email: this.email(),
      token: this.token(),
      newPassword: this.resetForm.value.newPassword!
    }
    this.authService.resetPassword(dto).subscribe({
      next: () => {
        this.dialogService.log(
          'Password Reset Success!',
          'Your password has been successfully reset. You can now log in with your new password.'
        ).subscribe(() => this.router.navigate(['/login']));
      },
      error: (error) => {
        console.error('authService.forgotPassword', dto, error);
        this.dialogService.log(
          'Password Reset error',
          'Unable to reset password. The link may have expired or the token is invalid.',
          { type: 'error' }
        ).subscribe();
      }
    });
  }
}
