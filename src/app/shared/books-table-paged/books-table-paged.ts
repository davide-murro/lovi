import { Component, inject, input, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { DialogService } from '../../core/services/dialog.service';
import { ToasterService } from '../../core/services/toaster.service';
import { BooksService } from '../../core/services/books.service';
import { Pagination } from "../pagination/pagination";

@Component({
  selector: 'app-books-table-paged',
  imports: [RouterLink, FontAwesomeModule, Pagination],
  templateUrl: './books-table-paged.html',
  styleUrl: './books-table-paged.scss'
})
export class BooksTablePaged {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private booksService = inject(BooksService);

  faTrash = faTrash;
  faPen = faPen;

  pageNumber = input<number>(1);
  pageSize = input<number>(10);
  sortBy = input<string>('id');
  sortOrder = input<'asc' | 'desc'>('asc');
  search = input<string>('');

  controlRoute = input<boolean>(true);

  bookPagedQuery = signal({
    pageNumber: this.pageNumber(),
    pageSize: this.pageSize(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    search: this.search()
  } as PagedQuery);
  bookPagedResult = toSignal(
    toObservable(this.bookPagedQuery).pipe(
      switchMap(query => {
        return this.booksService.getPaged(query).pipe(
          catchError(err => {
            this.toasterService.show('Get Books failed', { type: 'error' });
            console.error('booksService.getPaged', query, err);
            return of(null);
          }),
        )
      })
    )
  );
  booksLoading = signal(false);
  booksError = signal(false);

  reload() {
    // This forces the signal to update and thus re-run the switchMap
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

  deleteBook(id: number) {
    this.dialogService.confirm('Delete Book', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.booksService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('Book deleted');
              this.bookPagedQuery.update((q) => ({
                ...q
              }));
            },
            error: (err) => {
              console.error('booksService.delete', id, err);
              this.toasterService.show('Book delete failed', { type: 'error' });
            }
          });
        }
      });
  }
}
