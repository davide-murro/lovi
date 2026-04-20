import { ResolveFn, Router } from '@angular/router';
import { Location } from '@angular/common';
import { EBooksService } from '../services/e-books.service';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { EBookDto } from '../models/dtos/e-book-dto.model';

export const eBookResolver: ResolveFn<EBookDto | null> = (route, state) => {
  const router = inject(Router);
  const location = inject(Location);
  const eBooksService = inject(EBooksService);

  const id = Number(route.paramMap.get('id'));

  return eBooksService.getById(id).pipe(
    catchError(() => {
      if (location.path() !== state.url) location.go(state.url);
      router.navigate(['/not-found'], { skipLocationChange: true });
      return of(null);
    })
  )
};
