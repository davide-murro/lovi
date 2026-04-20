import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, finalize } from 'rxjs';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { EBooksService } from '../../core/services/e-books.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination } from '../pagination/pagination';
import { EBookItem } from "../e-book-item/e-book-item";

@Component({
  selector: 'app-e-books-paged',
  imports: [Pagination, EBookItem],
  templateUrl: './e-books-paged.html',
  styleUrl: './e-books-paged.scss'
})
export class EBooksPaged {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private eBooksService = inject(EBooksService);

  pageNumber = input<number>(1);
  pageSize = input<number>(10);
  sortBy = input<string>('id');
  sortOrder = input<'asc' | 'desc'>('asc');
  search = input<string>('');

  controlRoute = input<boolean>(true);

  eBookPagedQuery = linkedSignal<PagedQuery>(() => ({
    pageNumber: this.pageNumber(),
    pageSize: this.pageSize(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    search: this.search()
  }));
  eBookPagedResult = toSignal(
    toObservable(this.eBookPagedQuery).pipe(
      switchMap(query => {
        this.eBooksError.set(false);
        this.eBooksLoading.set(true);
        return this.eBooksService.getPaged(query).pipe(
          catchError(err => {
            this.eBooksError.set(true);
            console.error('eBooksService.getPaged', query, err);
            return of(null);
          }),
          finalize(() => {
            this.eBooksLoading.set(false);
          })
        )
      })
    )
  );
  eBooksLoading = signal(false);
  eBooksError = signal(false);

  reload() {
    this.eBookPagedQuery.update(query => ({ ...query }));
  }

  nextPage() {
    const query = {
      ...this.eBookPagedQuery(),
      pageNumber: this.eBookPagedQuery().pageNumber + 1
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.eBookPagedQuery.set(query);
    }
  }

  prevPage() {
    const query = {
      ...this.eBookPagedQuery(),
      pageNumber: Math.max(1, this.eBookPagedQuery().pageNumber - 1)
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.eBookPagedQuery.set(query);
    }
  }

  setPage(pageNumber: number) {
    const query = {
      ...this.eBookPagedQuery(),
      pageNumber: pageNumber
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.eBookPagedQuery.set(query);
    }
  }

  setSort(sortBy: string, sortOrder: 'asc' | 'desc') {
    const query = {
      ...this.eBookPagedQuery(),
      sortBy: sortBy,
      sortOrder: sortOrder
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.eBookPagedQuery.set(query);
    }
  }

  setSearch(search: string) {
    const query = {
      ...this.eBookPagedQuery(),
      pageNumber: 1,
      search: search
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.eBookPagedQuery.set(query);
    }
  }
}
