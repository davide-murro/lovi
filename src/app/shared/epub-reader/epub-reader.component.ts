import { Component, computed, effect, ElementRef, input, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight, faCircleNotch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { EpubReader } from './epub-reader';
import { EpubReaderThemeStyle } from './epub-reader-theme-style.model';

@Component({
  selector: 'app-epub-reader',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './epub-reader.component.html',
  styleUrl: './epub-reader.component.scss'
})
export class EpubReaderComponent {
  // Set size to multiple of 10 due to ePub defect
  @ViewChild('readerContentWrapper')
  set wrapperRef(el: ElementRef | undefined) {
    if (this._resizeObserver) this._resizeObserver.disconnect();
    if (!el) return;

    this._resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;

      // Snap to multiple of 10 (defects)
      const snappedWidth = Math.floor(width / 10) * 10;
      const snappedHeight = Math.floor(height / 10) * 10;

      if (this.readerWidth() === snappedWidth && this.readerHeight() === snappedHeight) return;

      this.readerWidth.set(snappedWidth);
      this.readerHeight.set(snappedHeight);
      this.readerContent()?.style.setProperty('width', `${snappedWidth}px`);
      this.readerContent()?.style.setProperty('height', `${snappedHeight}px`);

      this._epubReader()?.updateResize();
    });
    this._resizeObserver.observe(el.nativeElement);
  }
  @ViewChild('readerContent')
  set readerContentRef(el: ElementRef | undefined) {
    this.readerContent.set(el?.nativeElement ?? null);
  }

  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faCircleNotch = faCircleNotch;
  faExclamationTriangle = faExclamationTriangle;

  epubReader = input<EpubReader>();
  src = input<string>();
  themeStyles = input<EpubReaderThemeStyle>();

  readerContent = signal<HTMLElement | null>(null);
  readerWidth = signal<number | null>(null);
  readerHeight = signal<number | null>(null);

  private _epubReader = signal<EpubReader>(new EpubReader());
  private _resizeObserver: ResizeObserver | null = null;

  isLoading = computed(() => this._epubReader()?.isLoading());
  isError = computed(() => this._epubReader()?.isError());
  errorMessage = computed(() => this._epubReader()?.errorMessage());

  chapters = computed(() => this._epubReader()?.chapters());
  currentChapterIndex = computed(() => this._epubReader()?.currentChapterIndex());

  hasNextPage = computed(() => this._epubReader()?.hasNextPage());
  hasPrevPage = computed(() => this._epubReader()?.hasPrevPage());

  constructor() {
    effect(() => {
      if (this.epubReader() && this.readerContent()) {
        this._epubReader.set(this.epubReader()!);
        this._epubReader()?.renderTo.set(this.readerContent());
        this._epubReader()?.load();
      } else if (this.src() && this.readerContent()) {
        this._epubReader()?.src.set(this.src()!);
        this._epubReader()?.renderTo.set(this.readerContent());
        this._epubReader()?.load();
      } else {
        this._epubReader()?.unload();
      }
    });
    effect(() => {
      if (this.themeStyles()) {
        this._epubReader()?.styles.set(this.themeStyles()!);
        this._epubReader()?.updateStyles();
      }
    });
  }

  ngOnDestroy() {
    if (this._resizeObserver) this._resizeObserver.disconnect();
    this._epubReader()?.src.set(null);
    this._epubReader()?.renderTo.set(null);
    this._epubReader()?.styles.set(null);
    this._epubReader()?.unload();
  }

  async onChapterInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (!isNaN(value)) {
      await this._epubReader()?.goToChapter(value - 1);
    }
  }

  async onPrevPage() {
    await this._epubReader()?.prevPage();
  }

  async onNextPage() {
    await this._epubReader()?.nextPage();
  }
}
