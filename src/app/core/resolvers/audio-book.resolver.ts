import { ResolveFn, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AudioBooksService } from '../services/audio-books.service';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AudioBookDto } from '../models/dtos/audio-book-dto.model';

export const audioBookResolver: ResolveFn<AudioBookDto | null> = (route, state) => {
  const id = Number(route.paramMap.get('id'));
  const router = inject(Router);
  const location = inject(Location);
  const audioBooksService = inject(AudioBooksService);

  return audioBooksService.getById(id).pipe(
    catchError(() => {
      if (location.path() !== state.url) location.go(state.url);
      router.navigate(['/not-found'], { skipLocationChange: true }); 
      return of(null);
    })
  )
};
