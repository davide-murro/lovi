import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { FileBook } from '../models/file-book.model';
import { EpubReader } from '../../shared/epub-reader/epub-reader';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FileBookReaderService {
  private authService = inject(AuthService);

  private epubReader = new EpubReader();

  currentFileBook = signal<FileBook | null>(null);

  // EpubJS Book instance
  chapters = computed(() => this.epubReader.chapters());
  currentChapterIndex = computed(() => this.epubReader.currentChapterIndex());
  currentChapterContent = computed(() => this.epubReader.currentChapterContent());

  isLoading = computed(() => this.epubReader.isLoading());
  isError = computed(() => this.epubReader.isError());

  constructor() {
    effect(() => {
      if (!this.authService.isLoggedIn()) {
        this.destroyReader();
      }
    });
  }


  private async loadFileBook(fileBook: FileBook) {
    if (!fileBook?.fileSrc) return;

    this.epubReader.src.set(fileBook.fileSrc);
    await this.epubReader.load();
  }

  private unloadFileBook() {
    this.epubReader.unload();
  }

  private async loadChapter(index: number) {
    await this.epubReader.goToChapter(index);
  }



  initReader(fileBook: FileBook) {
    this.unloadFileBook();
    this.currentFileBook.set(fileBook);
    if (fileBook) {
      this.loadFileBook(fileBook);
    }
  }

  destroyReader() {
    this.currentFileBook.set(null);
    this.unloadFileBook();
  }

  prevChapter() {
    if (this.currentChapterIndex() > 0) {
      this.loadChapter(this.currentChapterIndex() - 1);
    }
  }

  nextChapter() {
    if (this.currentChapterIndex() < this.chapters().length - 1) {
      this.loadChapter(this.currentChapterIndex() + 1);
    }
  }

  goToChapter(index: number) {
    if (index >= 0 && index < this.chapters().length) {
      this.loadChapter(index);
    }
  }
}
