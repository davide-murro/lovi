import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Location } from '@angular/common';
import { UserProfileDto } from '../models/dtos/user-profile-dto.model';
import { UsersService } from '../services/users.service';
import { catchError, of } from 'rxjs';

export const userProfileResolver: ResolveFn<UserProfileDto | null> = (route, state) => {
  const router = inject(Router);
  const location = inject(Location);
  const usersService = inject(UsersService);

  // Return the Observable/Promise; the router waits for it to complete.
  return usersService.getMe().pipe(
    catchError(() => {
      if (location.path() !== state.url) location.go(state.url);
      router.navigate(['/not-found'], { skipLocationChange: true });
      return of(null);
    }));
};
