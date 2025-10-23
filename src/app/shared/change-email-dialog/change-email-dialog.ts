import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeEmailDto } from '../../core/models/dtos/change-email-dto.model';
import { AuthService } from '../../core/services/auth.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToasterService } from '../../core/services/toaster.service';

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
    newEmail: new FormControl('', [Validators.required, Validators.email])
  });

  submit() {
    if (!this.form.valid) return;

    const changeEmail: ChangeEmailDto = {
      newEmail: this.form.value.newEmail!
    }

    this.authService.changeEmail(changeEmail).subscribe({
      next: () => {
        this.dialogService.close(changeEmail.newEmail);
      },
      error: (err) => {
        console.error('authService.changeEmail', changeEmail, err);
        this.toasterService.show(
          err.error?.at(-1)?.description ?? 'Changing email failed', 
          { type: 'error' }
        );
      }
    });
  }
}
