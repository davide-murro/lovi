import { Component, inject, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { PagedQuery } from '../../../core/models/dtos/pagination/paged-query.model';
import { CreatorsService } from '../../../core/services/creators.service';
import { DialogService } from '../../../core/services/dialog.service';
import { CreatorDto } from '../../../core/models/dtos/creator-dto.model';
import { ToasterService } from '../../../core/services/toaster.service';

@Component({
  selector: 'app-select-creator-dialog',
  imports: [],
  templateUrl: './select-creator-dialog.html',
  styleUrl: './select-creator-dialog.scss'
})
export class SelectCreatorDialog {
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private creatorsService = inject(CreatorsService);

  creatorPagedQuery = signal({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'id',
    sortOrder: 'asc',
    search: ''
  } as PagedQuery);
  creatorPagedResult = toSignal(
    toObservable(this.creatorPagedQuery).pipe(
      switchMap(query =>
        this.creatorsService.getPaged(query).pipe(
          catchError(err => {
            this.toasterService.show('Get Creators failed', { type: 'error' });
            console.error('creatorsService.getPaged', query, err);
            return of(null);
          })
        )
      )
    )
  );

  selectCreator(creator: CreatorDto) {
    this.dialogService.close(creator);
  }
}
