import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PodcastsService } from '../../../core/services/podcasts.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-podcast-detail',
  imports: [RouterLink],
  templateUrl: './podcast-details.html',
  styleUrl: './podcast-details.scss'
})
export class PodcastDetails {
  private route = inject(ActivatedRoute);
  private podcastService = inject(PodcastsService);

  podcast = toSignal(
    this.route.paramMap.pipe(
      map(params => Number(params.get('id')) || 0),
      switchMap(id =>
        this.podcastService.getById(id!).pipe(
          catchError(err => {
            console.error('Error fetching podcast details:', err);
            return of(null);
          })
        )
      )
    )
  );
}
