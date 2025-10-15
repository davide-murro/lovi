import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PodcastsService } from '../services/podcasts.service';
import { catchError, of } from 'rxjs';
import { PodcastEpisodeDto } from '../models/dtos/podcast-episode-dto.model';

export const podcastEpisodeResolver: ResolveFn<PodcastEpisodeDto | null> = (route, state) => {
  const id = Number(route.paramMap.get('id'));
  const episodeId = Number(route.paramMap.get('episodeId'));
  const podcastsService = inject(PodcastsService);

  // if user logged add isInMyLibrary
  return podcastsService.getEpisodeById(id, episodeId).pipe(
    catchError(() => {
      return of(null);
    })
  );
};
