import { Component, inject, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { switchMap, catchError, of } from 'rxjs';
import { CreatorDto } from '../../../core/models/dtos/creator-dto.model';
import { PagedQuery } from '../../../core/models/dtos/pagination/paged-query.model';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { passwordValidator } from '../../../core/validators/password-validator';
import { UsersService } from '../../../core/services/users.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChangePasswordDto } from '../../../core/models/dtos/change-password-dto.model';
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

  submit() {
    if (!this.form.valid) return;

    const changePassword: ChangePasswordDto = {
      currentPassword: this.form.value.currentPassword!,
      newPassword: this.form.value.newPassword!
    }

    this.authService.changePassword(changePassword).subscribe({
      next: () => {
        this.dialogService.close(true);
      },
      error: (err) => {
        console.error('authService.changePassword', changePassword, err);
        this.toasterService.show(
          err.error[0]?.description ?? 'Changing email failed', 
          { type: 'error' }
        );
      }
    });
  }
}
