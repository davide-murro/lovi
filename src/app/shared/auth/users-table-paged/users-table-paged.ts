import { Component, effect, inject, input, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, finalize, filter } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen, faQuestion, faTrash } from '@fortawesome/free-solid-svg-icons';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ForgotPasswordDto } from '../../../core/models/dtos/auth/forgot-password-dto.model';
import { PagedQuery } from '../../../core/models/dtos/pagination/paged-query.model';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-users-table-paged',
  imports: [RouterLink, FontAwesomeModule],
  templateUrl: './users-table-paged.html',
  styleUrl: './users-table-paged.scss'
})
export class UsersTablePaged {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);

  faTrash = faTrash;
  faQuestion = faQuestion;
  faPen = faPen;

  pageNumber = input<number>(1);
  pageSize = input<number>(10);
  sortBy = input<string>('id');
  sortOrder = input<'asc' | 'desc'>('asc');
  search = input<string>('');

  controlRoute = input<boolean>(true);

  userPagedQuery = signal<PagedQuery>(null!);
  userPagedResult = toSignal(
    toObservable(this.userPagedQuery).pipe(
      filter(query => !!query),
      switchMap(query => {
        this.usersError.set(false);
        this.usersLoading.set(true);
        return this.usersService.getPaged(query).pipe(
          catchError(err => {
            this.usersError.set(true);
            console.error('usersService.getPaged', query, err);
            return of(null);
          }),
          finalize(() => {
            this.usersLoading.set(false);
          })
        )
      })
    )
  );
  usersLoading = signal(false);
  usersError = signal(false);

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
      this.userPagedQuery.set(query);
    });
  }

  reload() {
    // This forces the signal to update and thus re-run the switchMap
    this.userPagedQuery.update(query => ({ ...query }));
  }

  nextPage() {
    const query = {
      ...this.userPagedQuery(),
      pageNumber: this.userPagedQuery().pageNumber + 1
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.userPagedQuery.set(query);
    }
  }

  prevPage() {
    const query = {
      ...this.userPagedQuery(),
      pageNumber: Math.max(1, this.userPagedQuery().pageNumber - 1)
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.userPagedQuery.set(query);
    }
  }

  setPage(pageNumber: number) {
    const query = {
      ...this.userPagedQuery(),
      pageNumber: pageNumber
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.userPagedQuery.set(query);
    }
  }

  setSort(sortBy: string, sortOrder: 'asc' | 'desc') {
    const query = {
      ...this.userPagedQuery(),
      sortBy: sortBy,
      sortOrder: sortOrder
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.userPagedQuery.set(query);
    }
  }

  setSearch(search: string) {
    const query = {
      ...this.userPagedQuery(),
      pageNumber: 1,
      search: search
    };

    if (this.controlRoute()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: query,
      })
    } else {
      this.userPagedQuery.set(query);
    }
  }


  deleteUser(id: string) {
    this.dialogService.confirm('Delete User', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.usersService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('User deleted');
              this.userPagedQuery.update((u) => ({
                ...u
              }));
            },
            error: (err) => {
              console.error('usersService.delete', id, err);
              this.toasterService.show('User delete failed', { type: 'error' });
            }
          });
        }
      });
  }
  forgotPasswordUser(email: string) {
    this.dialogService.confirm('Forgot password', 'Start forgot password process?')
      .subscribe(confirmed => {
        if (confirmed) {
          const forgotPassword: ForgotPasswordDto = {
            email: email
          }
          this.authService.forgotPassword(forgotPassword).subscribe({
            next: () => {
              this.toasterService.show('User forgot password started');
            },
            error: (err) => {
              console.error('authService.forgotPassword', forgotPassword, err);
              this.toasterService.show('User forgot password failed', { type: 'error' });
            }
          });
        }
      });
  }
}
