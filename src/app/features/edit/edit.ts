import { Component, inject, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, finalize } from 'rxjs';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { PodcastsService } from '../../core/services/podcasts.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { faAdd, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from '../../core/services/dialog.service';
import { ToasterService } from '../../core/services/toaster.service';

@Component({
  selector: 'app-edit',
  imports: [FontAwesomeModule, RouterLink],
  templateUrl: './edit.html',
  styleUrl: './edit.scss'
})
export class Edit {
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private podcastsService = inject(PodcastsService);

  faAdd = faAdd;
  faPen = faPen;
  faTrash = faTrash;

  podcastPagedQuery = signal({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'id',
    sortOrder: 'asc',
    search: ''
  } as PagedQuery);
  podcastPagedResult = toSignal(
    toObservable(this.podcastPagedQuery).pipe(
      switchMap(query => {
        return this.podcastsService.getPaged(query).pipe(
          catchError(err => {
            this.toasterService.show('Get Podcasts failed', { type: 'error' });
            console.error('podcastsService.getPaged', query, err);
            return of(null);
          }),
        )
      })
    )
  );

  deletePodcast(id: number) {
    this.dialogService.confirm('Delete Podcast', 'Are you sure vecm?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.podcastsService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('Podcast Deleted');
              this.podcastPagedQuery.update((q) => ({
                ...q
              }));
            },
            error: (err) => {
              this.toasterService.show('Podcast delete failed', { type: 'error' });
              console.error('podcastsService.delete', id, err);
            }
          });
        }
      });
  }
}
