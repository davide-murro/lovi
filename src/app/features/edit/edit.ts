import { Component, inject, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { PodcastsService } from '../../core/services/podcasts.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { faAdd, faPen, faQuestion, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from '../../core/services/dialog.service';
import { ToasterService } from '../../core/services/toaster.service';
import { CreatorsService } from '../../core/services/creators.service';
import { AudioBooksService } from '../../core/services/audio-books.service';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { AuthDirective } from "../../core/directives/auth.directive";
import { UsersTablePaged } from "../../shared/users-table-paged/users-table-paged";

@Component({
  selector: 'app-edit',
  imports: [FontAwesomeModule, RouterLink, AuthDirective, UsersTablePaged],
  templateUrl: './edit.html',
  styleUrl: './edit.scss'
})
export class Edit {
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private audioBooksService = inject(AudioBooksService);
  private podcastsService = inject(PodcastsService);
  private creatorsService = inject(CreatorsService);

  faAdd = faAdd;
  faPen = faPen;
  faTrash = faTrash;
  faQuestion = faQuestion;

  audioBookPagedQuery = signal({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'id',
    sortOrder: 'desc',
    search: ''
  } as PagedQuery);
  audioBookPagedResult = toSignal(
    toObservable(this.audioBookPagedQuery).pipe(
      switchMap(query => {
        return this.audioBooksService.getPaged(query).pipe(
          catchError(err => {
            this.toasterService.show('Get Audio Books failed', { type: 'error' });
            console.error('audioBooksService.getPaged', query, err);
            return of(null);
          }),
        )
      })
    )
  );

  podcastPagedQuery = signal({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'id',
    sortOrder: 'desc',
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

  creatorPagedQuery = signal({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'id',
    sortOrder: 'desc',
    search: ''
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

  deleteAudioBook(id: number) {
    this.dialogService.confirm('Delete Audio Book', 'Are you sure vecm?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.audioBooksService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('Audio Book deleted');
              this.audioBookPagedQuery.update((q) => ({
                ...q
              }));
            },
            error: (err) => {
              console.error('audioBooksService.delete', id, err);
              this.toasterService.show('Audio Book delete failed', { type: 'error' });
            }
          });
        }
      });
  }

  deletePodcast(id: number) {
    this.dialogService.confirm('Delete Podcast', 'Are you sure vecm?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.podcastsService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('Podcast deleted');
              this.podcastPagedQuery.update((q) => ({
                ...q
              }));
            },
            error: (err) => {
              console.error('podcastsService.delete', id, err);
              this.toasterService.show('Podcast delete failed', { type: 'error' });
            }
          });
        }
      });
  }

  deleteCreator(id: number) {
    this.dialogService.confirm('Delete Creator', 'Are you sure vecm?')
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
