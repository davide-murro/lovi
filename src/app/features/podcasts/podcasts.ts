import { Component, inject, signal } from '@angular/core';
import { PodcastsService } from '../../core/services/podcasts.service';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-podcasts',
  imports: [RouterLink],
  templateUrl: './podcasts.html',
  styleUrl: './podcasts.scss'
})
export class Podcasts {
  private podcastService = inject(PodcastsService);

  podcastPagedQuery = signal({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'id',
    sortOrder: 'asc'
  } as PagedQuery);
  podcastPagedResult = toSignal(
    toObservable(this.podcastPagedQuery).pipe(
      switchMap(query =>
        this.podcastService.getPaged(query).pipe(
          catchError(err => {
            console.error('Error fetching podcasts:', err);
            return of(null);
          })
        )
      )
    )
  );

  nextPage() {
    this.podcastPagedQuery.update(query => ({
      ...query,
      pageNumber: query.pageNumber + 1
    }));
  }
  prevPage() {
    this.podcastPagedQuery.update(query => ({
      ...query,
      pageNumber: query.pageNumber - 1
    }));
  }
  setPage(pageNumber: number) {
    this.podcastPagedQuery.update(query => ({
      ...query,
      pageNumber: pageNumber
    }));
  }

  setSort(sortBy: string, sortOrder: 'asc' | 'desc') {
    this.podcastPagedQuery.update(query => ({
      ...query,
      sortBy: sortBy,
      sortOrder: sortOrder
    }));
  }
}
