import { Component, inject, signal } from '@angular/core';
import { AudioBooksService } from '../../core/services/audio-books.service';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-audio-books',
  imports: [RouterLink],
  templateUrl: './audio-books.html',
  styleUrl: './audio-books.scss'
})
export class AudioBooks {
  private audioBooksService = inject(AudioBooksService);

  audioBookPagedQuery = signal({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'id',
    sortOrder: 'asc'
  } as PagedQuery);
  audioBookPagedResult = toSignal(
    toObservable(this.audioBookPagedQuery).pipe(
      switchMap(query => {
        this.audioBooksError.set(false);
        this.audioBooksLoading.set(true);
        return this.audioBooksService.getPaged(query).pipe(
          catchError(err => {
            this.audioBooksError.set(true);
            console.error('audioBooksService.getPaged', query, err);
            return of(null);
          }),
          finalize(() => {
            this.audioBooksLoading.set(false);
          })
        )
      })
    )
  );
  audioBooksLoading = signal(false);
  audioBooksError = signal(false);

  reload() {
    this.audioBookPagedQuery.update(query => ({
      ...query
    }));
  }
}
