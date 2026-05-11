import { inject, signal } from '@angular/core';
import { createLoader, Book, Reader } from '@asteasolutions/epub-reader';
import { EpubReaderStyle } from './epub-reader-style.model';
import { firstValueFrom, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export class EpubReader {
  private http = inject(HttpClient);

  src = signal<string | null>(null);
  renderTo = signal<HTMLElement | null>(null);
  styles = signal<EpubReaderStyle | null>(null);

  private _isReady = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);
  private _isError = signal<boolean>(false);
  private _errorMessage = signal<any | null>(null);

  private _book = signal<Book | null>(null);
  private _reader = signal<Reader | null>(null);

  private _chapters = signal<string[]>([]);
  private _currentChapterIndex = signal<number>(0);

  private _totalPages = signal<number>(0);
  private _currentPage = signal<number>(0);

  private _eventSubscriptions: Subscription[] = [];
  private _resizeObserver = new ResizeObserver(() => this.updateSize());

  // public readonly signals
  isReady = this._isReady.asReadonly();
  isLoading = this._isLoading.asReadonly();
  isError = this._isError.asReadonly();
  errorMessage = this._errorMessage.asReadonly();

  chapters = this._chapters.asReadonly();
  currentChapterIndex = this._currentChapterIndex.asReadonly();

  totalPages = this._totalPages.asReadonly();
  currentPage = this._currentPage.asReadonly();

  // Navigation helpers
  private wheelDebounce = 100;
  private lastWheelTime = 0;
  private touchStartX = 0;
  private touchStartY = 0;

  async load() {
    const src = this.src();
    const element = this.renderTo();
    if (!src || !element) {
      this.unload();
      return;
    }

    this._isReady.set(false);
    this._isLoading.set(true);
    this._isError.set(false);
    this._errorMessage.set(null);

    this.http.get(src, { responseType: 'blob' }).subscribe({
      next: async (blob) => {
        try {
          this.unload();

          // the library handles both URLs and Blobs
          const loader = await createLoader(blob);
          if (!loader) throw new Error('Loader is null');

          // Monkey-patch the loader to fix a bug in @asteasolutions/epub-reader
          // where it returns cached blob URLs even when text content is requested.
          // This happens when a chapter file (like cover.xhtml) is also used as a cover resource.
          const originalFetch = loader.fetch.bind(loader);
          loader.fetch = (path: string, asURL?: boolean) => {
            if (!asURL && (loader as any).objectURLCache?.has(path)) {
              (loader as any).objectURLCache.delete(path);
            }
            return originalFetch(path, asURL);
          };

          // get book
          const book = await firstValueFrom(Book.open(loader));
          if (!book) throw new Error('Book is null');
          this._book.set(book);

          /*// get chapters (from toc)
          const nav = await firstValueFrom(book.nav);
          if (!nav) throw new Error("Nav is null");
          this._chapters.set(nav.toc.map((item) => item.href) as string[]);
          */
          // get chapters (from spine)
          const allSpineIds = book.getSpineRefIds();
          if (!allSpineIds) throw new Error("Spine ids are null");
          this._chapters.set(allSpineIds);

          // create reader
          const reader = new Reader(element, book);
          if (!reader) throw new Error('Reader is null');
          this._reader.set(reader);

          // Event listeners
          this._eventSubscriptions.push(
            reader.events.chapterChange.subscribe(() => {
              // this will be called also the first time
              this._currentChapterIndex.set(reader.currentChapterIndex);
              this.updateSize();
              this.updateStyles();
            }),
            reader.events.pageChange.subscribe(() => {
              this._totalPages.set(reader.totalPages);
              this._currentPage.set(reader.currentPage + 1);
            })
          );

          // Start observing the element for size changes
          this._resizeObserver.disconnect();
          this._resizeObserver.observe(element);

          // iframe events
          this.setupIframeEvents();

          // Load initial content
          await firstValueFrom(reader.loadContent());
        } catch (err) {
          console.error('EpubReader.load', err);
          this.unload();
          this._isError.set(true);
          this._errorMessage.set(err);
        } finally {
          this._isReady.set(true);
          this._isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('EpubReader.load', err);
        this.unload();
        this._isReady.set(true);
        this._isLoading.set(false);
        this._isError.set(true);
        this._errorMessage.set(err);
      }
    });
  }


  private setupIframeEvents() {
    const reader = this._reader();
    if (!reader || !reader.iframe) return;

    const doc = reader.iframe.contentDocument;
    if (!doc) return;

    // Use arrow functions to maintain 'this' context
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - this.lastWheelTime < this.wheelDebounce) return;

      if (Math.abs(e.deltaY) > 10) {
        this.lastWheelTime = now;
        if (e.deltaY > 0) this.nextPage();
        else if (e.deltaY < 0) this.prevPage();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      this.touchStartX = e.changedTouches[0].clientX;
      this.touchStartY = e.changedTouches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - this.touchStartX;
      const diffY = touchEndY - this.touchStartY;
      const threshold = 50;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        if (diffX > 0) this.prevPage();
        else this.nextPage();
      }
    };

    doc.addEventListener('wheel', onWheel, { passive: true });
    doc.addEventListener('touchstart', onTouchStart, { passive: true });
    doc.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  unload() {
    try {
      this._eventSubscriptions.forEach((s) => s.unsubscribe());
      this._eventSubscriptions = [];
      this._resizeObserver.disconnect();

      this._reader()?.destroy();
      this._reader.set(null);
      this._book.set(null);
      this._chapters.set([]);
      this._currentChapterIndex.set(0);
      this._totalPages.set(0);
      this._currentPage.set(0);
    } catch (err) {
      console.error('EpubReader.unload', err);
    }
  }

  // make width and height a multiple of 10 to prevent changed page bugs
  updateSize() {
    const reader = this._reader();
    const renderTo = this.renderTo();
    if (!reader || !reader.iframe || !renderTo) return;

    // get iframe document and set styles
    const iframe = reader.iframe;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    try {
      // Ensure iframe and internal document are a multiple of 10
      let w = 0;
      let h = 0;
      if (iframe) {
        const rect = renderTo.getBoundingClientRect();
        w = Math.floor(rect.width / 10) * 10;
        h = Math.floor(rect.height / 10) * 10;
        iframe.style.width = `${w}px`;
        iframe.style.height = `${h}px`;

        // Set background on the iframe itself to prevent white flash in Safari
        // We set it to transparent and allow transparency so the parent's background shows through
        iframe.style.background = 'transparent';
        iframe.style.colorScheme = 'dark light';
        iframe.setAttribute('allowtransparency', 'true');
      }

      // Inject a style tag to ensure all elements in the iframe are styled correctly
      let styleTag = doc.getElementById('epub-reader-size') as HTMLStyleElement;
      if (!styleTag) {
        styleTag = doc.createElement('style');
        styleTag.id = 'epub-reader-size';
        doc.head.appendChild(styleTag);
      }

      // add padding to hides overflow text of the next page
      styleTag.textContent = `
        html {
          width: ${w}px;
          height: ${h}px;
          word-break: break-word;
        }
        body {
          padding: 5px;
        }
        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      `;

      if (reader.currentPage >= reader.totalPages) {
        reader.goToPage(Math.max(0, reader.totalPages - 1));
      } else if (reader.currentPage < 0) {
        reader.goToPage(0);
      } else {
        reader.goToPage(reader.currentPage);
      }
    } catch (err) {
      console.error('EpubReader.updateSize', err);
    }
  }

  updateStyles() {
    const reader = this._reader();
    const styles = this.styles();
    if (!reader || !styles || !reader.iframe) return;

    // get iframe document and set styles
    const iframe = reader.iframe;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    try {
      // Inject or update style tag
      let styleTag = doc.getElementById('epub-reader-styles') as HTMLStyleElement;
      if (!styleTag) {
        styleTag = doc.createElement('style');
        styleTag.id = 'epub-reader-styles';
        doc.head.appendChild(styleTag);
      }

      // set style
      styleTag.textContent = `
        html, body {
          background: ${styles.background};
          color: ${styles.color};
          font-size: ${styles['font-size']};
        }
      `;

      // If we increase font size, it keeps the previous pagination, causing the last page to be blank.
      if (reader.currentPage >= reader.totalPages) {
        reader.goToPage(Math.max(0, reader.totalPages - 1));
      } else if (reader.currentPage < 0) {
        reader.goToPage(0);
      } else {
        reader.goToPage(reader.currentPage);
      }
    } catch (err) {
      console.error('EpubReader.updateStyles', err);
    }
  }

  prevPage() {
    const reader = this._reader();
    if (!reader || this.isLoading()) return;

    this._isError.set(false);
    this._errorMessage.set(null);
    try {
      reader.previousPage();
    } catch (err) {
      console.error('EpubReader.prevPage', err);
      this._isError.set(true);
      this._errorMessage.set(err);
    }
  }

  nextPage() {
    const reader = this._reader();
    if (!reader || this.isLoading()) return;

    this._isError.set(false);
    this._errorMessage.set(null);
    try {
      reader.nextPage();
    } catch (err) {
      console.error('EpubReader.nextPage', err);
      this._isError.set(true);
      this._errorMessage.set(err);
    }
  }

  async goToChapter(index: number) {
    const reader = this._reader();
    if (!reader || this.isLoading()) return;

    const chapters = this._chapters();
    const chapterIndex = this._currentChapterIndex();
    if (index < 0 || index >= chapters.length || index == chapterIndex) return;

    this._isLoading.set(true);
    this._isError.set(false);
    this._errorMessage.set(null);
    try {
      const chapterId = chapters[index];
      await firstValueFrom(reader.loadChapter(chapterId));
      reader.goToPage(0);
    } catch (err) {
      console.error('EpubReader.goToChapter', err);
      this._isError.set(true);
      this._errorMessage.set(err);
    } finally {
      this._isLoading.set(false);
    }
  }
}

