import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { PodcastsService } from '../services/podcasts.service';
import { PodcastDto } from '../models/dtos/podcast-dto.model';
import { catchError, forkJoin, map, of } from 'rxjs';
import { LibrariesService } from '../services/libraries.service';
import { AuthService } from '../services/auth.service';

export const podcastResolver: ResolveFn<PodcastDto | null> = (route, state) => {
  const id = Number(route.paramMap.get('id'));
  const router = inject(Router);
  const podcastsService = inject(PodcastsService);
  const librariesService = inject(LibrariesService);
  const authService = inject(AuthService);

  // if user logged add isInMyLibrary
  return forkJoin({
    podcast: podcastsService.getById(id),
    libraries: authService.isLoggedIn() ? librariesService.getMe() : of(null)
  }).pipe(
    map(result => result.podcast),
    catchError(() => {
      router.navigate(['/podcasts']);
      return of(null);
    })
  );
};
