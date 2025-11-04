import { Component, inject, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { RoleDto } from '../../../core/models/dtos/auth/role-dto.model';
import { PagedQuery } from '../../../core/models/dtos/pagination/paged-query.model';
import { DialogService } from '../../../core/services/dialog.service';
import { RolesService } from '../../../core/services/roles.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { Pagination } from '../../pagination/pagination';

@Component({
  selector: 'app-role-selector-dialog',
  imports: [Pagination],
  templateUrl: './role-selector-dialog.html',
  styleUrl: './role-selector-dialog.scss'
})
export class RoleSelectorDialog {
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private rolesService = inject(RolesService);


  rolePagedQuery = signal<PagedQuery>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'id',
    sortOrder: 'asc',
    search: ''
  });
  rolePagedResult = toSignal(
    toObservable(this.rolePagedQuery).pipe(
      switchMap(query =>
        this.rolesService.getPaged(query).pipe(
          catchError(err => {
            this.toasterService.show('Get Roles failed', { type: 'error' });
            console.error('rolesService.getPaged', query, err);
            return of(null);
          })
        )
      )
    )
  );

  reload() {
    // This forces the signal to update and thus re-run the switchMap
    this.rolePagedQuery.update(query => ({ ...query }));
  }

  nextPage() {
    this.rolePagedQuery.update(query => ({
      ...query,
      pageNumber: this.rolePagedQuery().pageNumber + 1
    }));
  }

  prevPage() {
    this.rolePagedQuery.update(query => ({
      ...query,
      pageNumber: Math.max(1, this.rolePagedQuery().pageNumber - 1)
    }));
  }

  setPage(pageNumber: number) {
    this.rolePagedQuery.update(query => ({
      ...query,
      pageNumber: pageNumber
    }));
  }

  setSort(sortBy: string, sortOrder: 'asc' | 'desc') {
    this.rolePagedQuery.update(query => ({
      ...query,
      sortBy: sortBy,
      sortOrder: sortOrder
    }));
  }

  setSearch(search: string) {
    this.rolePagedQuery.update(query => ({
      ...query,
      pageNumber: 1,
      search: search
    }));
  }

  // select and close dialog
  selectRole(role: RoleDto) {
    this.dialogService.close(role);
  }
}
