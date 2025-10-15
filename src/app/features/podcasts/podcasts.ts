import { Component, inject, signal } from '@angular/core';
import { PodcastsService } from '../../core/services/podcasts.service';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-podcasts',
  imports: [RouterLink],
  templateUrl: './podcasts.html',
  styleUrl: './podcasts.scss'
})
export class Podcasts {
  private podcastsService = inject(PodcastsService);

  podcastPagedQuery = signal({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'id',
    sortOrder: 'asc'
  } as PagedQuery);
  podcastPagedResult = toSignal(
    toObservable(this.podcastPagedQuery).pipe(
      switchMap(query => {
        this.podcastsError.set(false);
        this.podcastsLoading.set(true);
        return this.podcastsService.getPaged(query).pipe(
          catchError(err => {
            this.podcastsError.set(true);
            console.error('podcastsService.getPaged', query, err);
            return of(null);
          }),
          finalize(() => {
            this.podcastsLoading.set(false);
          })
        )
      })
    )
  );
  podcastsLoading = signal(false);
  podcastsError = signal(false);

  reload() {
    this.podcastPagedQuery.update(query => ({
      ...query
    }));
  }

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
