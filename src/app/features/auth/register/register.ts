import { Component, inject, signal, Signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterDto } from '../../../core/models/dtos/auth/register-dto.model';
import { Router } from '@angular/router';
import { valuesMatchValidator } from '../../../core/validators/values-match-validator';
import { passwordValidator } from '../../../core/validators/password-validator';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, passwordValidator]),
    passwordRepeat: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
  }, { validators: valuesMatchValidator(['password', 'passwordRepeat']) });

  isLoading = signal(false);;
  register(): void {
    if (!this.form.valid) return;

    let dto: RegisterDto = {
      email: this.form.value.email!,
      password: this.form.value.password!,
      name: this.form.value.name!
    }
    this.isLoading.set(true);
    this.authService.register(dto).subscribe({
      next: () => {
        this.dialogService.log(
          $localize`Registration successful`,
          $localize`Please check your email inbox to verify your account, then sing in into LOVI`)
          .subscribe(() => this.router.navigate(['/auth', 'login']));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('authService.register', dto, err);
        if ((Array.isArray(err.error) && err.error.some((e: any) => e.code === 'DuplicateEmail'))) {
          this.dialogService.log(
            $localize`Registration failed`,
            $localize`Email is already taken.`,
            { type: 'error' }
          );
        } else {
          this.dialogService.log(
            $localize`Registration failed`,
            $localize`Registration failed, unexpected error.`,
            { type: 'error' }
          );
        }
        this.isLoading.set(false);
      }
    });
  }
}
