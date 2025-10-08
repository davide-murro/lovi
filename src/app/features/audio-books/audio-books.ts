import { Component, inject, signal } from '@angular/core';
import { AudioBooksService } from '../../core/services/audio-books.service';
import { PagedQuery } from '../../core/models/dtos/pagination/paged-query.model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
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
      switchMap(query =>
        this.audioBooksService.getPaged(query).pipe(
          catchError(err => {
            console.error('Error fetching audio books:', err);
            return of(null);
          })
        )
      )
    )
  );
}
