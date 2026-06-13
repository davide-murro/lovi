import { Component, inject, signal, computed } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { of, catchError, finalize, defer } from "rxjs";
import { PodcastDto } from "../../../core/models/dtos/podcast-dto.model";
import { LibrariesService } from "../../../core/services/libraries.service";
import { BookItem } from "../../../shared/book-item/book-item";
import { PodcastDetailsItem } from "../../../shared/podcast-details-item/podcast-details-item";


@Component({
  selector: 'app-my-library',
  imports: [FontAwesomeModule, BookItem, PodcastDetailsItem],
  templateUrl: './my-library.html',
  styleUrl: './my-library.scss'
})
export class MyLibrary {
  private librariesService = inject(LibrariesService);

  // Online Data Signal with Loading/Error
  myLibraryLoading = signal(false);
  myLibraryError = signal(false);
  myLibraryData = toSignal(defer(() => {
    this.myLibraryError.set(false);
    this.myLibraryLoading.set(true);

    return this.librariesService.getMe().pipe(
      catchError(err => {
        this.myLibraryError.set(true);
        console.error('librariesService.getMe', err);
        return of(null);
      }),
      finalize(() => this.myLibraryLoading.set(false))
    );
  }));

  // library  
  myLibraryBooks = computed(() => {
    const list = this.myLibraryData()
      ?.filter((ml) => ml.book?.id != null)
      .map(ml => ml.book!);
    return list;
  });

  myLibraryPodcasts = computed(() => {
    const grouped = this.myLibraryData()
      ?.filter((ml) => ml.podcast?.id != null)
      .reduce((acc, ml) => {
        const pToFind = ml.podcast!;
        const pFound = acc.find(a => a.id === pToFind.id);
        if (pFound) pFound.episodes!.push(ml.podcastEpisode!);
        else acc.push({ ...pToFind, episodes: [ml.podcastEpisode!] })
        return acc;
      }, [] as PodcastDto[]);

    grouped?.forEach(p => p.episodes?.sort((a, b) => (a.number ?? 0) - (b.number ?? 0)));

    return grouped;
  });
}
