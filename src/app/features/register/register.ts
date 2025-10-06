import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
      next: () => {
        this.toasterService.show('Registration successful! Check your email and then login in LOVI!');
        this.router.navigate(["/login"]);
      },
      error: (err) => console.error('Registration failed', err)
    });
  }
}
