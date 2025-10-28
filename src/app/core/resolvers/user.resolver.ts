import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { UsersService } from '../services/users.service';
import { UserDto } from '../models/dtos/auth/user-dto.model';

export const userResolver: ResolveFn<UserDto | null> = (route, state) => {
  const id = route.paramMap.get('id')!;
  const router = inject(Router);
  const usersService = inject(UsersService);

  return usersService.getById(id).pipe(
    catchError(() => {
      router.navigate(['/not-found'], { skipLocationChange: true });
      return of(null);
    })
  );
};
