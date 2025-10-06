import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { PodcastsService } from '../services/podcasts.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { PodcastEpisodeDto } from '../models/dtos/podcast-episode-dto.model';
import { LibrariesService } from '../services/libraries.service';
import { AuthService } from '../services/auth.service';

export const podcastEpisodeResolver: ResolveFn<PodcastEpisodeDto | null> = (route, state) => {
  const id = Number(route.paramMap.get('id'));
  const episodeId = Number(route.paramMap.get('episodeId'));
  const router = inject(Router);
  const podcastsService = inject(PodcastsService);
  const librariesService = inject(LibrariesService);
  const authService = inject(AuthService);

  // if user logged add isInMyLibrary
  return forkJoin({
    podcastEpisode: podcastsService.getEpisodeById(id, episodeId),
    libraries: authService.isLoggedIn() ? librariesService.getMe() : of(null)
  }).pipe(
    map(result => result.podcastEpisode),
    catchError(() => {
      router.navigate(['/podcasts']);
      return of(null);
    })
  );
};
