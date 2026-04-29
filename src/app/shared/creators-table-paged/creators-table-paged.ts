import { Component, inject, input, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { DialogService } from '../../core/services/dialog.service';
import { ToasterService } from '../../core/services/toaster.service';
import { CreatorsService } from '../../core/services/creators.service';
import { Pagination } from "../pagination/pagination";

@Component({
  selector: 'app-creators-table-paged',
  imports: [RouterLink, FontAwesomeModule, Pagination],
  templateUrl: './creators-table-paged.html',
  styleUrl: './creators-table-paged.scss'
})
export class CreatorsTablePaged {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private creatorsService = inject(CreatorsService);

  faTrash = faTrash;
  faPen = faPen;

  pageNumber = input<number>(1);
  pageSize = input<number>(10);
  sortBy = input<string>('id');
  sortOrder = input<'asc' | 'desc'>('asc');
  search = input<string>('');

  controlRoute = input<boolean>(true);


  creatorPagedQuery = signal({
    pageNumber: this.pageNumber(),
    pageSize: this.pageSize(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    search: this.search()
  } as PagedQuery);
  creatorPagedResult = toSignal(
    toObservable(this.creatorPagedQuery).pipe(
      switchMap(query => {
        return this.creatorsService.getPaged(query).pipe(
          catchError(err => {
            this.toasterService.show('Get Creators failed', { type: 'error' });
            console.error('creatorsService.getPaged', query, err);
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
    this.creatorPagedQuery.update(query => ({ ...query }));
  }

  nextPage() {
    const query = {
      ...this.creatorPagedQuery(),
      pageNumber: this.creatorPagedQuery().pageNumber + 1
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.creatorPagedQuery.set(query);
    }
  }

  prevPage() {
    const query = {
      ...this.creatorPagedQuery(),
      pageNumber: Math.max(1, this.creatorPagedQuery().pageNumber - 1)
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.creatorPagedQuery.set(query);
    }
  }

  setPage(pageNumber: number) {
    const query = {
      ...this.creatorPagedQuery(),
      pageNumber: pageNumber
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.creatorPagedQuery.set(query);
    }
  }

  setSort(sortBy: string, sortOrder: 'asc' | 'desc') {
    const query = {
      ...this.creatorPagedQuery(),
      sortBy: sortBy,
      sortOrder: sortOrder
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.creatorPagedQuery.set(query);
    }
  }

  setSearch(search: string) {
    const query = {
      ...this.creatorPagedQuery(),
      pageNumber: 1,
      search: search
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.creatorPagedQuery.set(query);
    }
  }

  deleteCreator(id: number) {
    this.dialogService.confirm('Delete Creator', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.creatorsService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('Creator deleted');
              this.creatorPagedQuery.update((q) => ({
                ...q
              }));
            },
            error: (err) => {
              console.error('creatorsService.delete', id, err);
              this.toasterService.show('Creator delete failed', { type: 'error' });
            }
          });
        }
      });
  }
}
