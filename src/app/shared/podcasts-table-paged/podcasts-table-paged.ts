import { Component, inject, input, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { DialogService } from '../../core/services/dialog.service';
import { ToasterService } from '../../core/services/toaster.service';
import { PodcastsService } from '../../core/services/podcasts.service';
import { Pagination } from "../pagination/pagination";

@Component({
  selector: 'app-podcasts-table-paged',
  imports: [RouterLink, FontAwesomeModule, Pagination],
  templateUrl: './podcasts-table-paged.html',
  styleUrl: './podcasts-table-paged.scss'
})
export class PodcastsTablePaged {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private podcastsService = inject(PodcastsService);

  faTrash = faTrash;
  faPen = faPen;

  pageNumber = input<number>(1);
  pageSize = input<number>(10);
  sortBy = input<string>('id');
  sortOrder = input<'asc' | 'desc'>('asc');
  search = input<string>('');

  controlRoute = input<boolean>(true);

  podcastPagedQuery = signal({
    pageNumber: this.pageNumber(),
    pageSize: this.pageSize(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    search: this.search()
  } as PagedQuery);
  podcastPagedResult = toSignal(
    toObservable(this.podcastPagedQuery).pipe(
      switchMap(query => {
        return this.podcastsService.getPaged(query).pipe(
          catchError(err => {
            this.toasterService.show('Get Podcasts failed', { type: 'error' });
            console.error('podcastsService.getPaged', query, err);
            return of(null);
          }),
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

  deletePodcast(id: number) {
    this.dialogService.confirm('Delete Podcast', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.podcastsService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('Podcast deleted');
              this.podcastPagedQuery.update((q) => ({
                ...q
              }));
            },
            error: (err) => {
              console.error('podcastsService.delete', id, err);
              this.toasterService.show('Podcast delete failed', { type: 'error' });
            }
          });
        }
      });
  }
}
