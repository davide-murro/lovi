import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DeleteAccountDto } from '../../../core/models/dtos/auth/delete-account-dto.model';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';

@Component({
  selector: 'app-delete-account-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './delete-account-dialog.html',
  styleUrl: './delete-account-dialog.scss'
})
export class DeleteAccountDialog {
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);

  form = new FormGroup({
    password: new FormControl('', [Validators.required]),
  });

  isLoading = signal(false);
  submit() {
    if (!this.form.valid) return;

    const deleteAccount: DeleteAccountDto = {
      password: this.form.value.password!
    }

    this.isLoading.set(true);
    this.authService.deleteAccount(deleteAccount).subscribe({
      next: () => {
        this.dialogService.close(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('authService.deleteAccount', deleteAccount, err);
        this.toasterService.show(
          $localize`Deleting account failed`,
          { type: 'error' }
        );
        this.isLoading.set(false);
      }
    });
  }
}
