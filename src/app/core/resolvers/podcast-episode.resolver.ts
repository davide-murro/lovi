import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PodcastsService } from '../services/podcasts.service';
import { catchError, of } from 'rxjs';
import { PodcastEpisodeDto } from '../models/dtos/podcast-episode-dto.model';

export const podcastEpisodeResolver: ResolveFn<PodcastEpisodeDto | null> = (route, state) => {
  const podcastsService = inject(PodcastsService);
  const router = inject(Router);
  const location = inject(Location);

  const id = parseInt(route.paramMap.get('id')!);
  const episodeId = parseInt(route.paramMap.get('episodeId')!);

  return podcastsService.getEpisodeById(id, episodeId).pipe(
    catchError(() => {
      // change url without navigate to
      //location.replaceState(state.url);
      if (location.path() !== state.url) location.go(state.url);
      // navigate to without changing url
      router.navigate(['/not-found'], { skipLocationChange: true });
      return of(null);
    })
  );
};
