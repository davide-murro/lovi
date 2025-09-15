import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LoginDto } from '../../core/models/dtos/login-dto.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  authService = inject(AuthService);

  form = new FormGroup({
    userName: new FormControl(''),
    password: new FormControl(''),
    name: new FormControl(''),
  });

  login(): void {
    let dto: LoginDto = {
      userName: this.form.value.userName ?? '',
      password: this.form.value.password ?? ''
    }

    this.authService.login(dto).subscribe({
      next: (token) => console.log('Login successful!', token),
      error: (err) => console.error('Login failed', err)
    })
  }
}
