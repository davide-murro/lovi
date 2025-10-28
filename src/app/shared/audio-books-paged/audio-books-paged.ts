import { Component, effect, inject, input, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, finalize } from 'rxjs';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { AudioBooksService } from '../../core/services/audio-books.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Pagination } from '../pagination/pagination';
import { AudioBookItem } from "../audio-book-item/audio-book-item";

@Component({
  selector: 'app-audio-books-paged',
  imports: [RouterLink, Pagination, AudioBookItem],
  templateUrl: './audio-books-paged.html',
  styleUrl: './audio-books-paged.scss'
})
export class AudioBooksPaged {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private audioBooksService = inject(AudioBooksService);

  pageNumber = input<number>(1);
  pageSize = input<number>(10);
  sortBy = input(<string>'id');
  sortOrder = input<'asc' | 'desc'>('asc');
  search = input<string>('');

  controlRoute = input<boolean>(true);

  audioBookPagedQuery = signal<PagedQuery>(null!);
  audioBookPagedResult = toSignal(
    toObservable(this.audioBookPagedQuery).pipe(
      switchMap(query => {
        this.audioBooksError.set(false);
        this.audioBooksLoading.set(true);
        return this.audioBooksService.getPaged(query).pipe(
          catchError(err => {
            this.audioBooksError.set(true);
            console.error('audioBooksService.getPaged', query, err);
            return of(null);
          }),
          finalize(() => {
            this.audioBooksLoading.set(false);
          })
        )
      })
    )
  );
  audioBooksLoading = signal(false);
  audioBooksError = signal(false);
  
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
      this.audioBookPagedQuery.set(query);
    });
  }

  reload() {
    // This forces the signal to update and thus re-run the switchMap
    this.audioBookPagedQuery.update(query => ({ ...query }));
  }
  
  nextPage() {
    const query = {
      ...this.audioBookPagedQuery(),
      pageNumber: this.audioBookPagedQuery().pageNumber + 1
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.audioBookPagedQuery.set(query);
    }
  }

  prevPage() {
    const query = {
      ...this.audioBookPagedQuery(),
      pageNumber: Math.max(1, this.audioBookPagedQuery().pageNumber - 1)
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.audioBookPagedQuery.set(query);
    }
  }

  setPage(pageNumber: number) {
    const query = {
      ...this.audioBookPagedQuery(),
      pageNumber: pageNumber
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.audioBookPagedQuery.set(query);
    }
  }

  setSort(sortBy: string, sortOrder: 'asc' | 'desc') {
    const query = {
      ...this.audioBookPagedQuery(),
      sortBy: sortBy,
      sortOrder: sortOrder
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.audioBookPagedQuery.set(query);
    }
  }

  setSearch(search: string) {
    const query = {
      ...this.audioBookPagedQuery(),
      pageNumber: 1,
      search: search
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.audioBookPagedQuery.set(query);
    }
  }
}
