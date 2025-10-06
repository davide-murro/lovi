import { ResolveFn, Router } from '@angular/router';
import { LibraryDto } from '../models/dtos/library-dto.model';
import { inject } from '@angular/core';
import { LibrariesService } from '../services/libraries.service';
import { AuthService } from '../services/auth.service';
import { of, catchError, iif } from 'rxjs';

export const myLibraryResolver: ResolveFn<LibraryDto[] | null> = (route, state) => {
  const router = inject(Router);
  const librariesService = inject(LibrariesService);
  const authService = inject(AuthService);

  return iif(
    () => authService.isLoggedIn(), // Condition
    librariesService.getMe(),       // True: Observable to execute
    of(null)                        // False: Observable to execute
  ).pipe(
    catchError(() => {
        router.navigate(['/'])
        return of(null);
      })
  );  
};
