import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Location } from '@angular/common';
import { catchError, of } from 'rxjs';
import { UsersService } from '../services/users.service';
import { UserDto } from '../models/dtos/auth/user-dto.model';

export const userResolver: ResolveFn<UserDto | null> = (route, state) => {
  const id = route.paramMap.get('id')!;
  const router = inject(Router);
  const location = inject(Location);
  const usersService = inject(UsersService);

  return usersService.getById(id).pipe(
    catchError(() => {
      if (location.path() !== state.url) location.go(state.url);
      router.navigate(['/not-found'], { skipLocationChange: true });
      return of(null);
    })
  );
};
