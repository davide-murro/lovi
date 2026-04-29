import { inject, signal } from '@angular/core';
import ePub, { Book, Rendition } from '@likecoin/epub-ts';
import { HttpClient } from '@angular/common/http';
import { EpubReaderStyle } from './epub-reader-style.model';

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
  private _rendition = signal<Rendition | null>(null);
  private _chapters = signal<string[]>([]);
  private _currentChapterIndex = signal<number>(0);

  // public readonly signals
  isReady = this._isReady.asReadonly();
  isLoading = this._isLoading.asReadonly();
  isError = this._isError.asReadonly();
  errorMessage = this._errorMessage.asReadonly();

  chapters = this._chapters.asReadonly();
  currentChapterIndex = this._currentChapterIndex.asReadonly();

  //pages = this._pages.asReadonly();
  //currentPage = this._currentPage.asReadonly();

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
          // wait for the buffer
          const arrayBuffer = await blob.arrayBuffer();

          // delete old book
          if (this._rendition()) {
            this._rendition()!.off('relocated');
            this._rendition()!.off('resized');
            this._rendition()!.destroy();
          }
          this._rendition.set(null);
          if (this._book()) {
            this._book()!.destroy();
          }
          this._book.set(null);

          // init book
          this._book.set(ePub(arrayBuffer));
          if (!this._book()) throw new Error('Book is null');
          await this._book()!.opened;

          // collect chapters
          this._chapters.set(
            this._book()!.navigation.toc.map((item) => item.href)
          );

          // init rendition
          this._rendition.set(
            this._book()!.renderTo(element, {
              width: '100%',
              height: '100%',
              flow: 'paginated',
              direction: 'rtl',
              spread: 'auto',
              minSpreadWidth: 1024,
              allowScriptedContent: true,
              gap: 32,
            })
          );

          // rendition events
          let locationCfi: string;
          let justResized = false;
          let correcting = false;

          const wheelDebounce = 400;
          let lastWheelTime = 0;
          let touchStartX = 0;
          let touchStartY = 0;

          const onWheelListener = (e: WheelEvent) => {
            const now = Date.now();
            if (now - lastWheelTime < wheelDebounce) return;

            if (Math.abs(e.deltaY) > 10) {
              lastWheelTime = now;
              if (e.deltaY > 0) this.nextPage();
              else if (e.deltaY < 0) this.prevPage();
            }
          };

          const onTouchStartListener = (e: TouchEvent) => {
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
          };

          const onTouchEndListener = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            const threshold = 50;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
              if (diffX > 0) this.prevPage();
              else this.nextPage();
            }
          };

          this._rendition()!.on('rendered', (section: any, view: any) => {
            const doc = view.iframe.contentDocument;
            if (doc) {
              doc.addEventListener('wheel', onWheelListener, { passive: true });
              doc.addEventListener('touchstart', onTouchStartListener, { passive: true });
              doc.addEventListener('touchend', onTouchEndListener, { passive: true });
            }
          });

          this._rendition()!.on('relocated', (location) => {
            // update chapter index
            const chapterIndex = this._chapters().findIndex((chapter) => chapter === location.start.href);
            this._currentChapterIndex.set(chapterIndex);

            // if resized, correct location
            if (!justResized) {
              if (!correcting) {
                locationCfi = location.start.cfi;
              } else {
                correcting = false;
              }
            } else {
              justResized = false;
              correcting = true;
              this._rendition()!.display(locationCfi);
            }
          })
          this._rendition()!.on('resized', () => {
            justResized = true;
          });

          // display 
          await this._rendition()!.display();
          await this._rendition()!.started;

          // add style
          this.updateStyles();
          this.updateResize();
        } catch (err) {
          console.error(err);
          this.unload();
          this._isError.set(true);
          this._errorMessage.set(err);
        } finally {
          this._isReady.set(true);
          this._isLoading.set(false);
        }
      },
      error: (err) => {
        console.error(err);
        this.unload();
        this._isReady.set(true);
        this._isLoading.set(false);
        this._isError.set(true);
        this._errorMessage.set(err);
      }
    });
  }

  unload() {
    this._isError.set(false);
    this._errorMessage.set(null);

    try {
      if (this._rendition()) {
        this._rendition()!.off('rendered');
        this._rendition()!.off('relocated');
        this._rendition()!.off('resized');
        this._rendition()!.destroy();
      }
      if (this._book()) {
        this._book()!.destroy();
      }
      this._rendition.set(null);
      this._book.set(null);
      this._chapters.set([]);
      this._currentChapterIndex.set(0);
    } catch (err) {
      console.error(err);
      this._isError.set(true);
      this._errorMessage.set(err);
    }
  }

  updateResize() {
    const isReady = this._isReady();
    const rendition = this._rendition();
    if (!isReady || !rendition) return;

    try {
      this._rendition()!.resize();
    } catch (err) {
      console.error(err);
    }
  }

  updateStyles() {
    const isReady = this._isReady();
    const rendition = this._rendition();
    const styles = this.styles();
    if (!isReady || !rendition || !styles) return;

    try {
      Object.entries(styles).forEach(([key, value]) => {
        rendition.themes.override(key, value);
      });

      // update so it also update pagination if change size
      rendition.layout();
    } catch (err) {
      console.error(err);
    }
  }

  async prevPage() {
    this._isError.set(false);
    this._errorMessage.set(null);

    try {
      await this._rendition()?.prev();
    } catch (err) {
      console.error(err);
      this._isError.set(true);
      this._errorMessage.set(err);
    }
  }

  async nextPage() {
    this._isError.set(false);
    this._errorMessage.set(null);

    try {
      await this._rendition()?.next();
    } catch (err) {
      console.error(err);
      this._isError.set(true);
      this._errorMessage.set(err);
    }
  }

  async goToChapter(index: number) {
    if (index < 0 || index >= this._chapters().length) return;

    this._isLoading.set(true);
    this._isError.set(false);
    this._errorMessage.set(null);

    try {
      await this._rendition()?.display(this._chapters()[index]);
    } catch (err) {
      console.error(err);
      this._isError.set(true);
      this._errorMessage.set(err);
    } finally {
      this._isLoading.set(false);
    }
  }
}
