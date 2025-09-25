import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RegisterDto } from '../../core/models/dtos/register-dto.model';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private authService = inject(AuthService);

  form = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    name: new FormControl(''),
  });

  register(): void {
    let dto: RegisterDto = {
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
      name: this.form.value.name ?? ''
    }
    this.authService.register(dto).subscribe({
      next: () => console.log('Register successful!'),
      error: (err) => console.error('Register failed', err)
    });
  }
}
