import { ResolveFn, Router } from '@angular/router';
import { AudioBooksService } from '../services/audio-books.service';
import { inject } from '@angular/core';
import { LibrariesService } from '../services/libraries.service';
import { AuthService } from '../services/auth.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AudioBookDto } from '../models/dtos/audio-book-dto.model';

export const audioBookResolver: ResolveFn<AudioBookDto | null> = (route, state) => {
  const id = Number(route.paramMap.get('id'));
  const router = inject(Router);
  const audioBooksService = inject(AudioBooksService);
  const librariesService = inject(LibrariesService);
  const authService = inject(AuthService);

  // if user logged add isInMyLibrary
  return forkJoin({
    audioBook: audioBooksService.getById(id),
    libraries: authService.isLoggedIn() ? librariesService.getMe() : of(null)
  }).pipe(
    map(result => result.audioBook),
    catchError(() => {
      router.navigate(['/audioBooks']);
      return of(null);
    })
  );
};
