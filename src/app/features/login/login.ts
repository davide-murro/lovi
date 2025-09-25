import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LoginDto } from '../../core/models/dtos/login-dto.model';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  form = new FormGroup({
    userName: new FormControl(''),
    password: new FormControl(''),
    name: new FormControl(''),
  });

  login(): void {
    let dto: LoginDto = {
      userName: this.form.value.userName!,
      password: this.form.value.password!
    }

    this.authService.login(dto).subscribe({
      next: (token) => {
        console.log('Login successful!', token);
        this.router.navigate(['/']);
      },
      error: (err) => console.error('Login failed', err)
    })
  }
}
