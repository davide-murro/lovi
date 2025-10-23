import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginDto } from '../../core/models/dtos/login-dto.model';
import { Router, RouterLink } from '@angular/router';
import { ToasterService } from '../../core/services/toaster.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);

  form = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    password: new FormControl('', Validators.required),
  });

  login(): void {
    if (!this.form.valid) return;

    let dto: LoginDto = {
      userName: this.form.value.userName!,
      password: this.form.value.password!
    }

    this.authService.login(dto).subscribe({
      next: (token) => {
        this.toasterService.show('Login successful!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('authService.login', dto, err);
        this.toasterService.show('Login failed', { type: 'error' });
      }
    })
  }
}
