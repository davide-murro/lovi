import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { PodcastsService } from '../services/podcasts.service';
import { catchError, of } from 'rxjs';
import { PodcastEpisodeDto } from '../models/dtos/podcast-episode-dto.model';

export const podcastEpisodeResolver: ResolveFn<PodcastEpisodeDto | null> = (route, state) => {
  const id = Number(route.paramMap.get('id'));
  const router = inject(Router);
  const episodeId = Number(route.paramMap.get('episodeId'));
  const podcastsService = inject(PodcastsService);

  return podcastsService.getEpisodeById(id, episodeId).pipe(
    catchError(() => {
      router.navigate(['/not-found'], { skipLocationChange: true });
      return of(null);
    })
  );
};
