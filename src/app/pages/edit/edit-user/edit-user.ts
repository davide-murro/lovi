import { Component, effect, inject, input, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { faAdd, faPen, faQuestion, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ToasterService } from '../../../core/services/toaster.service';
import { UserDto } from '../../../core/models/dtos/auth/user-dto.model';
import { UsersService } from '../../../core/services/users.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { passwordValidator } from '../../../core/validators/password-validator';
import { DialogService } from '../../../core/services/dialog.service';
import { ForgotPasswordDto } from '../../../core/models/dtos/auth/forgot-password-dto.model';
import { AuthService } from '../../../core/services/auth.service';
import { RoleDto } from '../../../core/models/dtos/auth/role-dto.model';
import { RoleSelectorDialog } from '../../../shared/auth/role-selector-dialog/role-selector-dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-edit-user',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink, DatePipe],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.scss'
})
export class EditUser {
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private usersService = inject(UsersService);
  private authService = inject(AuthService);

  faAdd = faAdd;
  faPen = faPen;
  faTrash = faTrash;
  faQuestion = faQuestion;

  user = input<UserDto>();
  userEdit = signal<UserDto | undefined>(this.user());

  isLoading = signal(false);
  form = new FormGroup({
    id: new FormControl({ value: '', disabled: true }),
    newPassword: new FormControl('', [passwordValidator]),
    email: new FormControl('', [Validators.required, Validators.email]),
    emailConfirmed: new FormControl(false),
    name: new FormControl('', Validators.required),
  });

  constructor() {
    effect(() => {
      this.form.patchValue({
        id: this.user()?.id,
        newPassword: '',
        email: this.user()?.email,
        emailConfirmed: this.user()?.emailConfirmed,
        name: this.user()?.name,
      });
      this.userEdit.set(this.user());

      // add password required if new user
      if (this.userEdit()?.id) {
        this.form.get('newPassword')!.removeValidators([Validators.required]);
      } else {
        this.form.get('newPassword')!.addValidators([Validators.required]);
      }
      this.form.get('newPassword')!.updateValueAndValidity();
    });
  }

  load() {
    this.usersService.getById(
      this.userEdit()!.id!
    ).subscribe(
      {
        next: (user) => {
          this.userEdit.set(user);
        },
        error: (err) => {
          console.error('usersService.getById', this.userEdit()!.id!, err);
          this.toasterService.show('Get User failed', { type: 'error' });
        }
      });
  }

  // Form
  onSubmit() {
    if (!this.form.valid) return;

    const form = this.form.getRawValue();
    const u: UserDto = {
      id: form.id!,
      newPassword: form.newPassword!,
      email: form.email!,
      emailConfirmed: form.emailConfirmed!,
      name: form.name!
    }
    this.isLoading.set(true);
    if (this.userEdit()?.id != null) {
      this.usersService.update(this.userEdit()!.id!, u).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.dialogService.log('User updated', 'User updated successfully');
          this.load();
        },
        error: (err) => {
          console.error('usersService.update', this.userEdit()!.id!, u, err);
          this.isLoading.set(false);
          this.dialogService.log('User update failed', 'Failed to update user', { type: 'error' });
        }
      });
    } else {
      this.usersService.create(u).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.dialogService.log('User created', 'User created successfully');
          this.router.navigate(['/edit', 'users', res.id])
        },
        error: (err) => {
          console.error('usersService.update', u, err);
          this.isLoading.set(false);
          this.dialogService.log('User create failed', 'Failed to create user', { type: 'error' });
        }
      });

    }
  }

  delete() {
    this.dialogService.confirm('Delete User', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          const id = this.userEdit()!.id;
          this.usersService.delete(id).subscribe({
            next: () => {
              this.dialogService.log('User deleted', 'User deleted successfully');
              this.router.navigate(['/edit']);
            },
            error: (err) => {
              console.error('usersService.delete', id, err);
              this.dialogService.log('User delete failed', 'Failed to delete user', { type: 'error' });
            }
          });
        }
      });
  }
  forgotPassword() {
    this.dialogService.confirm('Forgot password', 'Start forgot password process?')
      .subscribe(confirmed => {
        if (confirmed) {
          const forgotPassword: ForgotPasswordDto = {
            email: this.userEdit()!.email
          }
          this.authService.forgotPassword(forgotPassword).subscribe({
            next: () => {
              this.dialogService.log('User forgot password started', 'Forgot password process started');
            },
            error: (err) => {
              console.error('authService.forgotPassword', forgotPassword, err);
              this.dialogService.log('User forgot password failed', 'Failed to start forgot password process', { type: 'error' });
            }
          });
        }
      });
  }

  addRole() {
    this.dialogService.open(RoleSelectorDialog)
      .subscribe((role: RoleDto) => {
        if (role) {
          this.usersService.addRole(this.userEdit()!.id!, role.id).subscribe({
            next: () => {
              this.dialogService.log('User Role added', 'User Role added successfully');
              this.load();
            },
            error: (err) => {
              console.error('usersService.addRole', this.userEdit()!.id!, role.id, err);
              this.dialogService.log('Add Role failed', 'Failed to add role', { type: 'error' });
            }
          });
        }
      });
  }
  removeRole(roleId: string) {
    this.dialogService.confirm('Remove User Role', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.usersService.removeRole(this.userEdit()!.id!, roleId).subscribe({
            next: () => {
              this.dialogService.log('User Role removed', 'User Role removed successfully');
              this.load();
            },
            error: (err) => {
              console.error('usersService.removeRole', this.userEdit()!.id!, roleId, err);
              this.dialogService.log('Remove Role failed', 'Failed to remove role', { type: 'error' });
            }
          });
        }
      });
  }
}
