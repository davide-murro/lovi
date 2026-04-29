import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, finalize } from 'rxjs';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { BooksService } from '../../core/services/books.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination } from '../pagination/pagination';
import { BookItem } from "../book-item/book-item";

@Component({
  selector: 'app-books-paged',
  imports: [Pagination, BookItem],
  templateUrl: './books-paged.html',
  styleUrl: './books-paged.scss'
})
export class BooksPaged {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private booksService = inject(BooksService);

  pageNumber = input<number>(1);
  pageSize = input<number>(10);
  sortBy = input<string>('id');
  sortOrder = input<'asc' | 'desc'>('asc');
  search = input<string>('');

  controlRoute = input<boolean>(true);

  bookPagedQuery = linkedSignal<PagedQuery>(() => ({
    pageNumber: this.pageNumber(),
    pageSize: this.pageSize(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    search: this.search()
  }));
  bookPagedResult = toSignal(
    toObservable(this.bookPagedQuery).pipe(
      switchMap(query => {
        this.booksError.set(false);
        this.booksLoading.set(true);
        return this.booksService.getPaged(query).pipe(
          catchError(err => {
            this.booksError.set(true);
            console.error('booksService.getPaged', query, err);
            return of(null);
          }),
          finalize(() => {
            this.booksLoading.set(false);
          })
        )
      })
    )
  );
  booksLoading = signal(false);
  booksError = signal(false);

  reload() {
    // This forces the signal to update and re-run the switchMap
    this.bookPagedQuery.update(query => ({ ...query }));
  }

  nextPage() {
    const query = {
      ...this.bookPagedQuery(),
      pageNumber: this.bookPagedQuery().pageNumber + 1
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.bookPagedQuery.set(query);
    }
  }

  prevPage() {
    const query = {
      ...this.bookPagedQuery(),
      pageNumber: Math.max(1, this.bookPagedQuery().pageNumber - 1)
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.bookPagedQuery.set(query);
    }
  }

  setPage(pageNumber: number) {
    const query = {
      ...this.bookPagedQuery(),
      pageNumber: pageNumber
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.bookPagedQuery.set(query);
    }
  }

  setSort(sortBy: string, sortOrder: 'asc' | 'desc') {
    const query = {
      ...this.bookPagedQuery(),
      sortBy: sortBy,
      sortOrder: sortOrder
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.bookPagedQuery.set(query);
    }
  }

  setSearch(search: string) {
    const query = {
      ...this.bookPagedQuery(),
      pageNumber: 1,
      search: search
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.bookPagedQuery.set(query);
    }
  }
}
