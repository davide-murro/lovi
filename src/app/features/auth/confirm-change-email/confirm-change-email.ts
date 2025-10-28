import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ConfirmChangeEmailDto } from '../../../core/models/dtos/auth/confirm-change-email-dto.model';

@Component({
  selector: 'app-confirm-change-email',
  imports: [ReactiveFormsModule],
  templateUrl: './confirm-change-email.html',
  styleUrl: './confirm-change-email.scss'
})
export class ConfirmChangeEmail {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);

  userId = toSignal<string>(this.route.queryParams.pipe(map(data => data['userId'])));
  newEmail = toSignal<string>(this.route.queryParams.pipe(map(data => data['newEmail'])));
  token = toSignal<string>(this.route.queryParams.pipe(map(data => data['token'])));

  isLoading = signal(false);
  onSubmit(): void {
    let dto: ConfirmChangeEmailDto = {
      userId: this.userId()!,
      newEmail: this.newEmail()!,
      token: this.token()!
    }
    this.isLoading.set(true);
    this.authService.confirmChangeEmail(dto).subscribe({
      next: () => {
        this.dialogService.log(
          'Changing email confirmed',
          `You can now login into LOVI with the new mail you chose and the old password.`,
        ).subscribe(() => this.router.navigate(['/auth', 'login']));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('authService.confirmChangeEmail', dto, error);
        this.dialogService.log(
          'Changing email confirmation failed',
          'Changing email confirmation failed, unexpected error',
          { type: 'error' }
        );
        this.isLoading.set(false);
      }
    });
  }
}
