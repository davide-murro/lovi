import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeEmailDto } from '../../../core/models/dtos/auth/change-email-dto.model';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';

@Component({
  selector: 'app-change-email-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './change-email-dialog.html',
  styleUrl: './change-email-dialog.scss'
})
export class ChangeEmailDialog {
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);

  form = new FormGroup({
    password: new FormControl('', [Validators.required]),
    newEmail: new FormControl('', [Validators.required, Validators.email])
  });

  isLoading = signal(false);
  submit() {
    if (!this.form.valid) return;

    const changeEmail: ChangeEmailDto = {
      password: this.form.value.password!,
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
        this.toasterService.show(
          (Array.isArray(err.error) ? (err.error.at(-1))?.description : null) ?? 'Changing email failed',
          { type: 'error' }
        );
        this.isLoading.set(false);
      }
    });
  }
}
