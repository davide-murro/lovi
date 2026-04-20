import { inject, signal } from '@angular/core';
import ePub, { Book, NavItem } from '@intity/epub-js';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export class EpubReader {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  src = signal<string | null>(null);

  private _isLoading = signal<boolean>(false);
  private _isError = signal<boolean>(false);
  private _errorMessage = signal<any | null>(null);

  // EpubJS Book instance
  private _book: Book | null = null;
  private _chapters = signal<NavItem[]>([]);
  private _currentChapterIndex = signal<number>(0);
  private _currentChapterContent = signal<SafeHtml>('');

  // public readonly signals
  isLoading = this._isLoading.asReadonly();
  isError = this._isError.asReadonly();
  errorMessage = this._errorMessage.asReadonly();

  chapters = this._chapters.asReadonly();
  currentChapterIndex = this._currentChapterIndex.asReadonly();
  currentChapterContent = this._currentChapterContent.asReadonly();


  private async loadFileBook() {
    const src = this.src();
    if (!src) return;

    this._isLoading.set(true);
    this._isError.set(false);
    this._errorMessage.set(null);

    this.http.get(src, { responseType: 'blob' }).subscribe({
      next: async (blob) => {
        try {
          const arrayBuffer = await blob.arrayBuffer();
          this._book = ePub(arrayBuffer);

          // Wait for metadata and navigation
          await this._book.opened;
          const navigation = await this._book.loaded.navigation;

          this._chapters.set(navigation.toc);
          this._currentChapterIndex.set(0);
          await this.loadChapter(0);

          this._isLoading.set(false);
        } catch (err) {
          this._isError.set(true);
          this._errorMessage.set(err);
          this._isLoading.set(false);
        }
      },
      error: (err) => {
        this._isLoading.set(false);
        this._isError.set(true);
        this._errorMessage.set(err);
      },
      complete: () => {
        this._isLoading.set(false);
      }
    });
  }

  private clearFileBook() {
    this._isLoading.set(false);
    this._isError.set(false);
    this._errorMessage.set(null);

    if (this._book) {
      this._book.destroy();
      this._book = null;
    }
    this._chapters.set([]);
    this._currentChapterIndex.set(0);
    this._currentChapterContent.set('');
  }

  private async loadChapter(index: number) {
    if (!this._book) return;
    if (index < 0 || index >= this.chapters().length) return;

    this._isLoading.set(true);
    try {
      const chapter = this.chapters()[index];
      const section = this._book.section(chapter.href);

      if (section) {
        // render() returns the processed HTML string for the section
        const content = await section.render(this._book.load.bind(this._book));

        this._currentChapterContent.set(this.sanitizer.bypassSecurityTrustHtml(content));
        this._currentChapterIndex.set(index);
      }
    } catch (err) {
      this._isError.set(true);
      this._errorMessage.set(err);
    } finally {
      this._isLoading.set(false);
    }
  }


  async load() {
    await this.loadFileBook();
  }

  unload() {
    this.clearFileBook();
  }

  async prevChapter() {
    if (this.currentChapterIndex() > 0) {
      await this.loadChapter(this.currentChapterIndex() - 1);
    }
  }

  async nextChapter() {
    if (this.currentChapterIndex() < this.chapters().length - 1) {
      await this.loadChapter(this.currentChapterIndex() + 1);
    }
  }

  async goToChapter(index: number) {
    if (index >= 0 && index < this.chapters().length) {
      await this.loadChapter(index);
    }
  }
}
