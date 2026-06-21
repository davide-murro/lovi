import { computed, effect, inject, Service, signal } from '@angular/core';
import { EBook } from '../models/e-book.model';
import { EpubReader } from '../../shared/epub-reader/epub-reader';
import { AuthService } from './auth.service';
import { EpubReaderStyle } from '../../shared/epub-reader/epub-reader-style.model';

@Service()
export class EBookReaderService {
  private authService = inject(AuthService);

  currentEBook = signal<EBook | null>(null);

  // EpubJS Book instance
  epubReader = signal<EpubReader>(new EpubReader());
  epubStyles = signal<EpubReaderStyle | null>(null);

  // EpubJS Book state
  chapters = computed(() => this.epubReader().chapters());
  currentChapterIndex = computed(() => this.epubReader().currentChapterIndex());

  totalPages = computed(() => this.epubReader().totalPages());
  currentPage = computed(() => this.epubReader().currentPage());

  isReady = computed(() => this.epubReader().isReady());
  isLoading = computed(() => this.epubReader().isLoading());
  isError = computed(() => this.epubReader().isError());
  errorMessage = computed(() => this.epubReader().errorMessage());

  completionPercentage = computed(() => {
    const chapters = this.chapters();
    const currentChapterIndex = this.currentChapterIndex();

    if (currentChapterIndex == null || !chapters?.length) {
      return 0;
    }

    const totalChapters = chapters.length;

    const pageProgress =
      this.totalPages() > 0
        ? this.currentPage() / this.totalPages()
        : 0;

    return (
      (currentChapterIndex + pageProgress) / totalChapters
    );
  });


  constructor() {
    effect(() => {
      if (!this.authService.isLoggedIn()) {
        this.destroyReader();
      }
    });
  }


  loadReader(eBook: EBook) {
    if (!eBook) return;

    this.currentEBook.set(eBook);
    this.epubReader().src.set(this.currentEBook()!.fileSrc);
  }

  destroyReader() {
    this.currentEBook.set(null);
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
