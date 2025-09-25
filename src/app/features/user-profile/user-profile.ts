import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { UserDto } from '../../core/models/dtos/user-dto.model';

@Component({
  selector: 'app-user-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile {
  private authService = inject(AuthService);
  private userService = inject(UsersService);
  private router = inject(Router);

  informationForm = new FormGroup({
    id: new FormControl(''),
    email: new FormControl({ value: '', disabled: true }),
    password: new FormControl({ value: 'xxxxxxxx', disabled: true }),
    name: new FormControl(''),
  });

  ngOnInit(): void {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.informationForm.patchValue(user);
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
      }
    });
  }


  editInformation(): void {
    let dto: UserDto = {
      id: this.informationForm.value.id!,
      name: this.informationForm.value.name!
    }
    this.userService.updateMe(dto).subscribe({
      next: () => { 
        console.log('Profile updated');
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
  deleteAccount(): void {

  }
}
