import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ConfirmEmailDto } from '../../../core/models/dtos/auth/confirm-email-dto.model';

@Component({
  selector: 'app-confirm-email',
  imports: [ReactiveFormsModule],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.scss'
})
export class ConfirmEmail {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);

  userId = toSignal<string>(this.route.queryParams.pipe(map(data => data['userId'])));
  token = toSignal<string>(this.route.queryParams.pipe(map(data => data['token'])));

  isLoading = signal(false);
  onSubmit(): void {
    let dto: ConfirmEmailDto = {
      userId: this.userId()!,
      token: this.token()!
    }
    this.isLoading.set(true);
    this.authService.confirmEmail(dto).subscribe({
      next: () => {
        this.dialogService.log(
          'Email confirmed',
          `You can now login into LOVI with the email and the password you chose during the registration.`,
        ).subscribe(() => this.router.navigate(['/auth', 'login']));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('authService.confirmEmail', dto, error);
        this.dialogService.log(
          'Email confirmation failed',
          'Email confirmation failed, unexpected error',
          { type: 'error' }
        );
        this.isLoading.set(false);
      }
    });
  }
}
