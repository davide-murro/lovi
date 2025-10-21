import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { PodcastsService } from '../services/podcasts.service';
import { PodcastDto } from '../models/dtos/podcast-dto.model';
import { catchError, of } from 'rxjs';

export const podcastResolver: ResolveFn<PodcastDto | null> = (route, state) => {
  const id = Number(route.paramMap.get('id'));
  const router = inject(Router);
  const podcastsService = inject(PodcastsService);

  return podcastsService.getById(id).pipe(
    catchError(() => {
      router.navigate(['/not-found'], { skipLocationChange: true });
      return of(null);
    })
  );
};
