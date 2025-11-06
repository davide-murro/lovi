import { Component, inject, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { CreatorsService } from '../../core/services/creators.service';
import { DialogService } from '../../core/services/dialog.service';
import { CreatorDto } from '../../core/models/dtos/creator-dto.model';
import { ToasterService } from '../../core/services/toaster.service';
import { Pagination } from "../pagination/pagination";

@Component({
  selector: 'app-creator-selector-dialog',
  imports: [Pagination],
  templateUrl: './creator-selector-dialog.html',
  styleUrl: './creator-selector-dialog.scss'
})
export class CreatorSelectorDialog {
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private creatorsService = inject(CreatorsService);


  creatorPagedQuery = signal<PagedQuery>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'id',
    sortOrder: 'asc',
    search: ''
  });
  creatorPagedResult = toSignal(
    toObservable(this.creatorPagedQuery).pipe(
      switchMap(query =>
        this.creatorsService.getPaged(query).pipe(
          catchError(err => {
            this.toasterService.show($localize`Get Creators failed`, { type: 'error' });
            console.error('creatorsService.getPaged', query, err);
            return of(null);
          })
        )
      )
    )
  );

  reload() {
    // This forces the signal to update and thus re-run the switchMap
    this.creatorPagedQuery.update(query => ({ ...query }));
  }

  nextPage() {
    this.creatorPagedQuery.update(query => ({
      ...query,
      pageNumber: this.creatorPagedQuery().pageNumber + 1
    }));
  }

  prevPage() {
    this.creatorPagedQuery.update(query => ({
      ...query,
      pageNumber: Math.max(1, this.creatorPagedQuery().pageNumber - 1)
    }));
  }

  setPage(pageNumber: number) {
    this.creatorPagedQuery.update(query => ({
      ...query,
      pageNumber: pageNumber
    }));
  }

  setSort(sortBy: string, sortOrder: 'asc' | 'desc') {
    this.creatorPagedQuery.update(query => ({
      ...query,
      sortBy: sortBy,
      sortOrder: sortOrder
    }));
  }

  setSearch(search: string) {
    this.creatorPagedQuery.update(query => ({
      ...query,
      pageNumber: 1,
      search: search
    }));
  }

  // select and close dialog
  selectCreator(creator: CreatorDto) {
    this.dialogService.close(creator);
  }
}
