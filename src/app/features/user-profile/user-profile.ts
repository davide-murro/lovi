import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { UserDto } from '../../core/models/dtos/user-dto.model';
import { map } from 'rxjs';
import { ToasterService } from '../../core/services/toaster.service';

@Component({
  selector: 'app-user-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);
  private userService = inject(UsersService);

  informationForm = new FormGroup({
    id: new FormControl(''),
    email: new FormControl({ value: '', disabled: true }),
    password: new FormControl({ value: 'xxxxxxxx', disabled: true }),
    name: new FormControl(''),
  });

  constructor() {
    const userProfile = this.route.snapshot.data['userProfile'];
    this.informationForm.patchValue(userProfile);
  }

  editInformation(): void {
    let dto: UserDto = {
      id: this.informationForm.value.id!,
      name: this.informationForm.value.name!
    }
    this.userService.updateMe(dto).subscribe({
      next: () => this.toasterService.show('Profile updated'),
      error: (error) => console.error('Error fetching user profile:', error)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
  deleteAccount(): void {

  }
}
