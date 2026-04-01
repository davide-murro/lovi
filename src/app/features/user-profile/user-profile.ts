import { Component, effect, inject, input, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { ToasterService } from '../../core/services/toaster.service';
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
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);
  private userService = inject(UsersService);

  faPen = faPen;

  userProfile = input.required<UserProfileDto>();

  logoutLoading = signal(false);
  informationLoading = signal(false);
  informationForm = new FormGroup({
    id: new FormControl<string>({ value: '', disabled: true }),
    email: new FormControl<string>({ value: '', disabled: true }),
    password: new FormControl<string>({ value: 'xxxxxxxx', disabled: true }),
    name: new FormControl<string>('', Validators.required),
  });

  constructor() {
    effect(() => {
      this.informationForm.patchValue({
        id: this.userProfile().id,
        email: this.userProfile().email!,
        name: this.userProfile().name
      });
    });
  }


  changeEmail() {
    this.dialogService.open(ChangeEmailDialog)
      .subscribe((result: boolean) => {
        if (result) {
          this.dialogService.log(
            $localize`Email changing confirmation sent`,
            $localize`Confirmation notices have been sent to both your old and new email addresses. Please confirm the new email to be able to log in.`
          ).subscribe();
        }
      });
  }
  changePassword() {
    this.dialogService.open(ChangePasswordDialog)
      .subscribe((result: boolean) => {
        if (result) {
          this.dialogService.log(
            $localize`Password changed`,
            $localize`Confirmation notices have been sent to your email addresses.`
          ).subscribe();
        }
      });
  }

  onSubmitInformation(): void {
    if (!this.informationForm.valid) return;

    let dto: UserProfileDto = {
      id: this.informationForm.value.id!,
      name: this.informationForm.value.name!
    }
    this.informationLoading.set(true);
    this.userService.updateMe(dto).subscribe({
      next: () => {
        this.toasterService.show($localize`Profile updated`, { type: 'success' });
        this.informationForm.reset(this.informationForm.getRawValue());
        this.informationLoading.set(false);
      },
      error: (error) => {
        console.error('userService.updateMe', dto, error);
        this.toasterService.show($localize`Profile update error`, { type: "error" });
        this.informationLoading.set(false);
      }
    });
  }

  logout(): void {
    this.dialogService.confirm(
      $localize`Log out`,
      $localize`You will be logged out of this browser session only. All other active sessions will remain logged in.`)
      .subscribe((res) => {
        if (res) {
          this.logoutLoading.set(true);
          this.authService.revoke().subscribe({
            next: () => {
              this.router.navigate(['/']);
              this.logoutLoading.set(false);
            },
            error: (error) => {
              console.error('authService.revoke', error);
              // Force logout even if revoke fails (e.g. due to network error), to prevent user from being stuck in a broken state
              this.authService.logout();
              this.router.navigate(['/']);
              this.logoutLoading.set(false);
            }
          });
        }
      });
  }
  logoutAll(): void {
    this.dialogService.confirm(
      $localize`Log out all devices`,
      $localize`You will be logged out of all browser sessions you have opened. Are you sure?`)
      .subscribe((res) => {
        if (res) {
          this.logoutLoading.set(true);
          this.authService.revokeAll().subscribe({
            next: () => {
              this.router.navigate(['/']);
              this.logoutLoading.set(false);
            },
            error: (error) => {
              console.error('authService.revokeAll', error);
              this.toasterService.show($localize`Log out from all devices error`, { type: "error" });
              this.logoutLoading.set(false);
            }
          });
        }
      });
  }

  deleteAccount(): void {
    this.dialogService.open(DeleteAccountDialog)
      .subscribe((result: boolean) => {
        if (result) {
          this.dialogService.log(
            $localize`Account deleted`,
            $localize`You will be redirected to the home page.`
          ).subscribe(() => this.router.navigate(['/']));
        }
      })
  }
}
