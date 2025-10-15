import { Component, computed, inject, Signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { UserDto } from '../../core/models/dtos/user-dto.model';
import { ToasterService } from '../../core/services/toaster.service';
import { map, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-profile',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);
  private userService = inject(UsersService);

  private _userProfile: Signal<UserDto> = toSignal(this.route.data.pipe(map(data => data['userProfile'])));
  userError = computed(() => this._userProfile() == null);

  form = new FormGroup({
    id: new FormControl<string>(this._userProfile()?.id),
    email: new FormControl<string>({ value: this._userProfile()?.email!, disabled: true }),
    password: new FormControl<string>({ value: 'xxxxxxxx', disabled: true }),
    name: new FormControl<string>(this._userProfile()?.name),
  });

  editInformation(): void {
    let dto: UserDto = {
      id: this.form.value.id!,
      name: this.form.value.name!
    }
    this.userService.updateMe(dto).subscribe({
      next: () => {
        this.toasterService.show('Profile updated')
      },
      error: (error) => {
        this.toasterService.show('Profile update error, please try again', { type: "error" });
        console.error('userService.updateMe', dto, error);
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
