import { Component, inject, signal, Signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { ToasterService } from '../../core/services/toaster.service';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DialogService } from '../../core/services/dialog.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { ChangeEmailDialog } from '../../shared/auth/change-email-dialog/change-email-dialog';
import { ChangePasswordDialog } from '../../shared/auth/change-password-dialog/change-password-dialog';
import { UserProfileDto } from '../../core/models/dtos/user-profile-dto.model';
import { DeleteAccountDialog } from '../../shared/auth/delete-account-dialog/delete-account-dialog';

@Component({
  selector: 'app-user-profile',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);
  private userService = inject(UsersService);

  faPen = faPen;

  private _userProfile: Signal<UserProfileDto> = toSignal(this.route.data.pipe(map(data => data['userProfile'])));

  onInformationLoading = signal(false);
  informationForm = new FormGroup({
    id: new FormControl(this._userProfile().id),
    email: new FormControl({ value: this._userProfile().email!, disabled: true }),
    password: new FormControl({ value: 'xxxxxxxx', disabled: true }),
    name: new FormControl(this._userProfile().name, Validators.required),
  });

  changeEmail() {
    this.dialogService.open(ChangeEmailDialog)
      .subscribe((result: boolean) => {
        if (result) {
          this.dialogService.log('Email changing confirmation sent!', 'Confirmation notices have been sent to both your old and new email addresses. Please confirm the new email to be able to log in again').subscribe();
        }
      });
  }
  changePassword() {
    this.dialogService.open(ChangePasswordDialog)
      .subscribe((result: boolean) => {
        if (result) {
          this.dialogService.log('Password changed!', 'Confirmation notices have been sent to your email addresses.').subscribe();
        }
      });
  }

  onSubmitInformation(): void {
    if (!this.informationForm.valid) return;

    let dto: UserProfileDto = {
      id: this.informationForm.value.id!,
      name: this.informationForm.value.name!
    }
    this.onInformationLoading.set(true);
    this.userService.updateMe(dto).subscribe({
      next: () => {
        this.toasterService.show('Profile updated', { type: 'success' });
        this.informationForm.reset(this.informationForm.getRawValue());
        this.onInformationLoading.set(false);
      },
      error: (error) => {
        console.error('userService.updateMe', dto, error);
        this.toasterService.show('Profile update error', { type: "error" });
        this.onInformationLoading.set(false);
      }
    });
  }

  logout(): void {
    this.dialogService.confirm(
      'Log out?',
      'You will be logged out of this browser session only. All other active sessions will remain logged in.')
      .subscribe((res) => {
        if (res) {
          this.authService.logout();
          this.router.navigate(['/']);
        }
      });
  }
  logoutAll(): void {
    this.dialogService.confirm(
      'Log out all devices?',
      'You will be logged out of all browser sessions you have opened. Are you sure?')
      .subscribe((res) => {
        if (res) {
          this.authService.revoke().subscribe({
            next: () => {
              this.router.navigate(['/']);
            },
            error: (error) => {
              console.error('authService.revoke', error);
              this.toasterService.show('Log out from all devices error', { type: "error" });
            }
          });
        }
      });
  }

  deleteAccount(): void {
    this.dialogService.open(DeleteAccountDialog)
      .subscribe((result: boolean) => {
        if (result) {
          this.dialogService.log('Account deleted!', 'You will be redirected to the home page.').subscribe();
          this.router.navigate(['/']);
        }
      })
  }
}
