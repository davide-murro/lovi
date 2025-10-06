import { ResolveFn, Router } from '@angular/router';
import { UserDto } from '../models/dtos/user-dto.model';
import { UsersService } from '../services/users.service';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';

export const userProfileResolver: ResolveFn<UserDto | null> = (route, state) => {
  const usersService = inject(UsersService);
  const router = inject(Router);

  // Return the Observable/Promise; the router waits for it to complete.
  return usersService.getMe().pipe(
    catchError(() => {
      router.navigate(['/'])
      return of(null);
    }));
};
