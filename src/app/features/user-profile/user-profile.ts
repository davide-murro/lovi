import { Component, inject, Signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { UserDto } from '../../core/models/dtos/user-dto.model';
import { ToasterService } from '../../core/services/toaster.service';
import { map, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DialogService } from '../../core/services/dialog.service';
import { ChangePasswordDialog } from './change-password-dialog/change-password-dialog';
import { ChangeEmailDialog } from './change-email-dialog/change-email-dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';

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

  private _userProfile: Signal<UserDto> = toSignal(this.route.data.pipe(map(data => data['userProfile'])));

  form = new FormGroup({
    id: new FormControl(this._userProfile().id),
    email: new FormControl({ value: this._userProfile().email!, disabled: true }),
    password: new FormControl({ value: 'xxxxxxxx', disabled: true }),
    name: new FormControl(this._userProfile().name, Validators.required),
  });

  changeEmail() {
    this.dialogService.open(ChangeEmailDialog)
      .subscribe((newEmail: string) => {
        if (newEmail) {
          this.form.patchValue({ email: newEmail });
          this.dialogService.log('Email changed!', 'Confirmation notices have been sent to both your old and new email addresses. Please confirm the new email to be able to log in again').subscribe();
        }
      })
  }
  changePassword() {
    this.dialogService.open(ChangePasswordDialog)
      .subscribe((result: boolean) => {
        if (result) {
          this.dialogService.log('Password changed!', 'Confirmation notices have been sent to your email addresses.').subscribe();
        }
      })
  }
  onSubmitInformation(): void {
    if (!this.form.valid) return;

    let dto: UserDto = {
      id: this.form.value.id!,
      name: this.form.value.name!
    }
    this.userService.updateMe(dto).subscribe({
      next: () => {
        this.toasterService.show('Profile updated');
        this.form.reset(this.form.getRawValue());
      },
      error: (error) => {
        console.error('userService.updateMe', dto, error);
        this.toasterService.show('Profile update error', { type: "error" });
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
    this.dialogService.confirm(
      'Delete account?',
      'Are you sure you want to permanently delete your account? All your data and information will be lost forever and cannot be recovered.')
      .subscribe((res) => {
        if (res) {
          this.authService.deleteAccount().subscribe({
            next: () => {
              this.toasterService.show('Account deleted');
              this.router.navigate(['/']);
            },
            error: (error) => {
              console.error('authService.deleteAccount', error);
              this.toasterService.show('Delete account error', { type: "error" });
            }
          });
        }
      });
  }
}
