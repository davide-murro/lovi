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
import { BooksService } from '../../core/services/books.service';
import { AuthDirective } from "../../core/directives/auth.directive";
import { RolesTablePaged } from '../../shared/auth/roles-table-paged/roles-table-paged';
import { UsersTablePaged } from '../../shared/auth/users-table-paged/users-table-paged';

@Component({
  selector: 'app-edit',
  imports: [FontAwesomeModule, RouterLink, AuthDirective, UsersTablePaged, RolesTablePaged],
  templateUrl: './edit.html',
  styleUrl: './edit.scss'
})
export class Edit {
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private booksService = inject(BooksService);
  private podcastsService = inject(PodcastsService);
  private creatorsService = inject(CreatorsService);

  faAdd = faAdd;
  faPen = faPen;
  faTrash = faTrash;
  faQuestion = faQuestion;

  bookPagedQuery = signal({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'id',
    sortOrder: 'desc',
    search: ''
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

  deletePodcast(id: number) {
    this.dialogService.confirm('Delete Podcast', 'Are you sure?')
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
