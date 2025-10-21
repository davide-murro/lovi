import { ResolveFn, Router } from '@angular/router';
import { LibraryDto } from '../models/dtos/library-dto.model';
import { inject } from '@angular/core';
import { LibrariesService } from '../services/libraries.service';
import { of, catchError } from 'rxjs';

export const myLibraryResolver: ResolveFn<LibraryDto[] | null> = (route, state) => {
  const router = inject(Router);
  const librariesService = inject(LibrariesService);

  return librariesService.getMe().pipe(
    catchError(() => {
      router.navigate(['/not-found'], { skipLocationChange: true });
      return of(null);
    })
  );
};
