import { Component, effect, inject, Signal, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { faAdd, faPen, faQuestion, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ToasterService } from '../../../core/services/toaster.service';
import { UserDto } from '../../../core/models/dtos/auth/user-dto.model';
import { UsersService } from '../../../core/services/users.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { passwordValidator } from '../../../core/validators/password-validator';
import { DialogService } from '../../../core/services/dialog.service';
import { ForgotPasswordDto } from '../../../core/models/dtos/auth/forgot-password-dto.model';
import { AuthService } from '../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private usersService = inject(UsersService);
  private authService = inject(AuthService);

  faAdd = faAdd;
  faPen = faPen;
  faTrash = faTrash;
  faQuestion = faQuestion;

  private _user: Signal<UserDto | null> = toSignal(this.route.data.pipe(map(data => data['user'])));

  user = signal<UserDto | null>(this._user());

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
        id: this._user()?.id,
        newPassword: '',
        email: this._user()?.email,
        emailConfirmed: this._user()?.emailConfirmed,
        name: this._user()?.name,
      });
      this.user.set(this._user());
    });
  }

  load() {
    this.usersService.getById(
      this.user()!.id!
    ).subscribe(
      {
        next: (user) => {
          this.user.set(user);
        },
        error: (err) => {
          console.error('usersService.getById', this.user()!.id!, err);
          this.toasterService.show('Get User failed', { type: 'error' });
        }
      });
  }

  // Form
  onSubmit() {
    if (this.form.invalid) return;

    const form = this.form.getRawValue();
    const u: UserDto = {
      id: form.id!,
      newPassword: form.newPassword!,
      email: form.email!,
      emailConfirmed: form.emailConfirmed!,
      name: form.name!
    }
    this.isLoading.set(true);
    if (this.user()?.id != null) {
      this.usersService.update(this.user()!.id!, u).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toasterService.show('User updated');
          this.load();
        },
        error: (err) => {
          console.error('usersService.update', this.user()!.id!, u, err);
          this.isLoading.set(false);
          this.toasterService.show('User update failed', { type: 'error' });
        }
      });
    } else {
      this.usersService.create(u).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.toasterService.show('User created');
          this.router.navigate(['/edit', 'users', res.id])
        },
        error: (err) => {
          console.error('usersService.update', u, err);
          this.isLoading.set(false);
          this.toasterService.show('User create failed', { type: 'error' });
        }
      });

    }
  }

  delete() {
    this.dialogService.confirm('Delete User', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          const id = this.user()!.id;
          this.usersService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('User deleted');
              this.router.navigate(['/edit']);
            },
            error: (err) => {
              console.error('usersService.delete', id, err);
              this.toasterService.show('User delete failed', { type: 'error' });
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
            email: this.user()!.email
          }
          this.authService.forgotPassword(forgotPassword).subscribe({
            next: () => {
              this.toasterService.show('User forgot password started');
            },
            error: (err) => {
              console.error('authService.forgotPassword', forgotPassword, err);
              this.toasterService.show('User forgot password failed', { type: 'error' });
            }
          });
        }
      });
  }

  addRole() {
      this.dialogService.open(RoleSelectorDialog)
        .subscribe((role: RoleDto) => {
          if (role) {
            this.usersService.addRole(this.user()!.id!, role.id).subscribe({
              next: () => {
                this.load();
              },
              error: (err) => {
                console.error('usersService.addRole', this.user()!.id!, role.id, err);
                this.toasterService.show('Add Role failed', { type: 'error' });
              }
            });
          }
        });
  }
  removeRole(roleId: string) {
    this.dialogService.confirm('Remove User Role', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.usersService.removeRole(this.user()!.id!, roleId).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('usersService.removeRole', this.user()!.id!, roleId, err);
              this.toasterService.show('Remove Role failed', { type: 'error' });
            }
          });
        }
      });
  }
}
