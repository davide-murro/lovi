import { Component, effect, inject, input, Signal, signal } from '@angular/core';
import { PodcastsService } from '../../core/services/podcasts.service';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, finalize, of, switchMap } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Pagination } from "../pagination/pagination";
import { PodcastItem } from "../podcast-item/podcast-item";

@Component({
  selector: 'app-podcasts-paged',
  imports: [RouterLink, Pagination, PodcastItem],
  templateUrl: './podcasts-paged.html',
  styleUrl: './podcasts-paged.scss'
})
export class PodcastsPaged {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private podcastsService = inject(PodcastsService);

  pageNumber = input<number>(1);
  pageSize = input<number>(10);
  sortBy = input<string>('id');
  sortOrder = input<'asc' | 'desc'>('asc');
  search = input<string>('');

  controlRoute = input<boolean>(true);

  podcastPagedQuery = signal<PagedQuery>(null!);
  podcastPagedResult = toSignal(
    toObservable(this.podcastPagedQuery).pipe(
      filter(query => !!query),
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

  constructor() {
    // Effect: Synchronizes the internal signal when any external input changes.
    // This allows the parent to override the current state at any time.
    effect(() => {
      const query = {
        pageNumber: Number(this.pageNumber()),
        pageSize: Number(this.pageSize()),
        sortBy: this.sortBy(),
        sortOrder: this.sortOrder(),
        search: this.search()
      };

      // Update the internal signal with the new input values.
      this.podcastPagedQuery.set(query);
    });
  }

  reload() {
    // This forces the signal to update and thus re-run the switchMap
    this.podcastPagedQuery.update(query => ({ ...query }));
  }

  nextPage() {
    const query = {
      ...this.podcastPagedQuery(),
      pageNumber: this.podcastPagedQuery().pageNumber + 1
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.podcastPagedQuery.set(query);
    }
  }

  prevPage() {
    const query = {
      ...this.podcastPagedQuery(),
      pageNumber: Math.max(1, this.podcastPagedQuery().pageNumber - 1)
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.podcastPagedQuery.set(query);
    }
  }

  setPage(pageNumber: number) {
    const query = {
      ...this.podcastPagedQuery(),
      pageNumber: pageNumber
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.podcastPagedQuery.set(query);
    }
  }

  setSort(sortBy: string, sortOrder: 'asc' | 'desc') {
    const query = {
      ...this.podcastPagedQuery(),
      sortBy: sortBy,
      sortOrder: sortOrder
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.podcastPagedQuery.set(query);
    }
  }

  setSearch(search: string) {
    const query = {
      ...this.podcastPagedQuery(),
      pageNumber: 1,
      search: search
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.podcastPagedQuery.set(query);
    }
  }
}
