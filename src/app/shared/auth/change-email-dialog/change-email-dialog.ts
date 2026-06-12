import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeEmailDto } from '../../../core/models/dtos/auth/change-email-dto.model';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { PasswordInput } from '../password-input/password-input';

@Component({
  selector: 'app-change-email-dialog',
  imports: [ReactiveFormsModule, PasswordInput],
  templateUrl: './change-email-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './change-email-dialog.scss'
})
export class ChangeEmailDialog {
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);

  form = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newEmail: new FormControl('', [Validators.required, Validators.email])
  });

  isLoading = signal(false);
  submit() {
    if (!this.form.valid) return;

    const changeEmail: ChangeEmailDto = {
      password: this.form.value.currentPassword!,
      newEmail: this.form.value.newEmail!
    }

    this.isLoading.set(true);
    this.authService.changeEmail(changeEmail).subscribe({
      next: () => {
        this.dialogService.close(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('authService.changeEmail', changeEmail, err);
        if ((Array.isArray(err.error) && err.error.some((e: any) => e.code === 'ChangeSameMail'))) {
          this.toasterService.show(
            $localize`The new email is the same as the current one.`,
            { type: 'error' }
          );
        } else if ((Array.isArray(err.error) && err.error.some((e: any) => e.code === 'DuplicateEmail'))) {
          this.toasterService.show(
            $localize`Email is already taken.`,
            { type: 'error' }
          );
        } else {
          this.toasterService.show(
            $localize`Email change failed`,
            { type: 'error' }
          );
        }
        this.isLoading.set(false);
      }
    });
  }

  cancel() {
    this.dialogService.close(false);
  }
}
