import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { FileBook } from '../models/file-book.model';
import { EpubReader } from '../../shared/epub-reader/epub-reader';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FileBookReaderService {
  private authService = inject(AuthService);

  currentFileBook = signal<FileBook | null>(null);

  // EpubJS Book instance
  epubReader = signal<EpubReader>(new EpubReader());

  // EpubJS Book state
  chapters = computed(() => this.epubReader().chapters());
  currentChapterIndex = computed(() => this.epubReader().currentChapterIndex());

  hasNextPage = computed(() => this.epubReader().hasNextPage());
  hasPrevPage = computed(() => this.epubReader().hasPrevPage());

  isReady = computed(() => this.epubReader().isReady());
  isLoading = computed(() => this.epubReader().isLoading());
  isError = computed(() => this.epubReader().isError());
  errorMessage = computed(() => this.epubReader().errorMessage());


  constructor() {
    effect(() => {
      if (!this.authService.isLoggedIn()) {
        this.destroyReader();
      }
    });
  }


  loadReader(fileBook: FileBook) {
    if (!fileBook) return;

    this.currentFileBook.set(fileBook);
    this.epubReader().src.set(this.currentFileBook()!.fileSrc);
  }

  destroyReader() {
    this.currentFileBook.set(null);
    this.epubReader().src.set(null);
  }

  prevPage() {
    this.epubReader().prevPage();
  }

  nextPage() {
    this.epubReader().nextPage();
  }

  goToChapter(index: number) {
    this.epubReader().goToChapter(index);
  }
}
