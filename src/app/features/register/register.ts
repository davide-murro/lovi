import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterDto } from '../../core/models/dtos/register-dto.model';
import { ToasterService } from '../../core/services/toaster.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);

  form = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', Validators.required),
    name: new FormControl<string>('', Validators.required),
  });

  register(): void {
    let dto: RegisterDto = {
      email: this.form.value.email!,
      password: this.form.value.password!,
      name: this.form.value.name!
    }
    this.authService.register(dto).subscribe({
      next: () => {
        this.toasterService.show('Registration successful! Please check your email inbox to verify your account');
        this.router.navigate(["/login"]);
      },
      error: (err) => {
        this.toasterService.show('Registration failed! Please try again', { type: 'error' });
        console.error('authService.register', dto, err);
      }
    });
  }
}
