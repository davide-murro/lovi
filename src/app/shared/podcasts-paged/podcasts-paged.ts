import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { PodcastsService } from '../../core/services/podcasts.service';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination } from "../pagination/pagination";
import { PodcastItem } from "../podcast-item/podcast-item";

@Component({
  selector: 'app-podcasts-paged',
  imports: [Pagination, PodcastItem],
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

  title = input<string>($localize`Podcasts`);
  controlRoute = input<boolean>(true);
  hidePagination = input<boolean>(false);

  podcastPagedQuery = linkedSignal<PagedQuery>(() => ({
    pageNumber: this.pageNumber(),
    pageSize: this.pageSize(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    search: this.search()
  }));
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
