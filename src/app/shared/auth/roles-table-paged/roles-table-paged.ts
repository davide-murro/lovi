import { Component, effect, inject, input, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faQuestion, faPen } from '@fortawesome/free-solid-svg-icons';
import { switchMap, catchError, of, finalize, filter } from 'rxjs';
import { PagedQuery } from '../../../core/models/dtos/pagination/paged-query.model';
import { DialogService } from '../../../core/services/dialog.service';
import { RolesService } from '../../../core/services/roles.service';
import { ToasterService } from '../../../core/services/toaster.service';

@Component({
  selector: 'app-roles-table-paged',
  imports: [RouterLink, FontAwesomeModule],
  templateUrl: './roles-table-paged.html',
  styleUrl: './roles-table-paged.scss'
})
export class RolesTablePaged {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private rolesService = inject(RolesService);

  faTrash = faTrash;
  faQuestion = faQuestion;
  faPen = faPen;

  pageNumber = input<number>(1);
  pageSize = input<number>(10);
  sortBy = input<string>('id');
  sortOrder = input<'asc' | 'desc'>('asc');
  search = input<string>('');

  controlRoute = input<boolean>(true);

  rolePagedQuery = signal<PagedQuery>(null!);
  rolePagedResult = toSignal(
    toObservable(this.rolePagedQuery).pipe(
      filter(query => !!query),
      switchMap(query => {
        this.rolesError.set(false);
        this.rolesLoading.set(true);
        return this.rolesService.getPaged(query).pipe(
          catchError(err => {
            this.rolesError.set(true);
            console.error('rolesService.getPaged', query, err);
            return of(null);
          }),
          finalize(() => {
            this.rolesLoading.set(false);
          })
        )
      })
    )
  );
  rolesLoading = signal(false);
  rolesError = signal(false);

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
      this.rolePagedQuery.set(query);
    });
  }

  reload() {
    // This forces the signal to update and thus re-run the switchMap
    this.rolePagedQuery.update(query => ({ ...query }));
  }

  nextPage() {
    const query = {
      ...this.rolePagedQuery(),
      pageNumber: this.rolePagedQuery().pageNumber + 1
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.rolePagedQuery.set(query);
    }
  }

  prevPage() {
    const query = {
      ...this.rolePagedQuery(),
      pageNumber: Math.max(1, this.rolePagedQuery().pageNumber - 1)
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.rolePagedQuery.set(query);
    }
  }

  setPage(pageNumber: number) {
    const query = {
      ...this.rolePagedQuery(),
      pageNumber: pageNumber
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.rolePagedQuery.set(query);
    }
  }

  setSort(sortBy: string, sortOrder: 'asc' | 'desc') {
    const query = {
      ...this.rolePagedQuery(),
      sortBy: sortBy,
      sortOrder: sortOrder
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.rolePagedQuery.set(query);
    }
  }

  setSearch(search: string) {
    const query = {
      ...this.rolePagedQuery(),
      pageNumber: 1,
      search: search
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.rolePagedQuery.set(query);
    }
  }


  deleteRole(id: string) {
    this.dialogService.confirm('Delete Role', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.rolesService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('Role deleted');
              this.rolePagedQuery.update((u) => ({
                ...u
              }));
            },
            error: (err) => {
              console.error('rolesService.delete', id, err);
              this.toasterService.show('Role delete failed', { type: 'error' });
            }
          });
        }
      });
  }
}
