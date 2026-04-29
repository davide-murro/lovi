import { ResolveFn, Router } from '@angular/router';
import { Location } from '@angular/common';
import { BooksService } from '../services/books.service';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { BookDto } from '../models/dtos/book-dto.model';

export const bookResolver: ResolveFn<BookDto | null> = (route, state) => {
  const router = inject(Router);
  const location = inject(Location);
  const booksService = inject(BooksService);

  const id = Number(route.paramMap.get('id'));

  return booksService.getById(id).pipe(
    catchError(() => {
      if (location.path() !== state.url) location.go(state.url);
      router.navigate(['/not-found'], { skipLocationChange: true });
      return of(null);
    })
  )
};
