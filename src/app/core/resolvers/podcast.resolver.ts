import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PodcastsService } from '../services/podcasts.service';
import { PodcastDto } from '../models/dtos/podcast-dto.model';
import { catchError, of } from 'rxjs';

export const podcastResolver: ResolveFn<PodcastDto | null> = (route, state) => {
  const id = Number(route.paramMap.get('id'));
  const podcastsService = inject(PodcastsService);

  // if user logged add isInMyLibrary
  return podcastsService.getById(id).pipe(
    catchError(() => {
      return of(null);
    })
  );
};
