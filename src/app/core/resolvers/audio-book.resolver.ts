import { ResolveFn } from '@angular/router';
import { AudioBooksService } from '../services/audio-books.service';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AudioBookDto } from '../models/dtos/audio-book-dto.model';

export const audioBookResolver: ResolveFn<AudioBookDto | null> = (route, state) => {
  const id = Number(route.paramMap.get('id'));
  const audioBooksService = inject(AudioBooksService);

  return audioBooksService.getById(id).pipe(
    catchError(() => {
      return of(null);
    })
  )
};
