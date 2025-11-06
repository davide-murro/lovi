import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ChangePasswordDto } from '../../../core/models/dtos/auth/change-password-dto.model';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { passwordValidator } from '../../../core/validators/password-validator';
import { valuesMatchValidator } from '../../../core/validators/values-match-validator';

@Component({
  selector: 'app-change-password-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password-dialog.html',
  styleUrl: './change-password-dialog.scss'
})
export class ChangePasswordDialog {
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);

  form = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, passwordValidator]),
    newPasswordRepeat: new FormControl('', Validators.required),
  }, { validators: valuesMatchValidator(['newPassword', 'newPasswordRepeat']) });

  isLoading = signal(false);
  submit() {
    if (!this.form.valid) return;

    const changePassword: ChangePasswordDto = {
      currentPassword: this.form.value.currentPassword!,
      newPassword: this.form.value.newPassword!
    }

    this.isLoading.set(true);
    this.authService.changePassword(changePassword).subscribe({
      next: () => {
        this.dialogService.close(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('authService.changePassword', changePassword, err);
        this.toasterService.show(
          $localize`Changing password failed`,
          { type: 'error' }
        );
        this.isLoading.set(false);
      }
    });
  }
}
