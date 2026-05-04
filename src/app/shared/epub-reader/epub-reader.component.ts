import { Component, computed, effect, ElementRef, input, OnDestroy, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight, faCircleNotch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { EpubReader } from './epub-reader';
import { EpubReaderStyle } from './epub-reader-style.model';

@Component({
  selector: 'app-epub-reader',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './epub-reader.component.html',
  styleUrl: './epub-reader.component.scss'
})
export class EpubReaderComponent implements OnDestroy {
  @ViewChild('readerContent')
  set readerContentRef(el: ElementRef | undefined) {
    this._readerContent.set(el?.nativeElement ?? null);
  }

  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faCircleNotch = faCircleNotch;
  faExclamationTriangle = faExclamationTriangle;

  // inputs - you can either provide an EpubReader object or a src string
  epubReader = input<EpubReader>();
  src = input<string>();
  styles = input<EpubReaderStyle>();
  fixedContentWidth = input<number>();
  fixedContentHeight = input<number>();

  private _epubReader = signal<EpubReader>(new EpubReader());
  private _readerContent = signal<HTMLElement | null>(null);

  isLoading = computed(() => this._epubReader()?.isLoading());
  isError = computed(() => this._epubReader()?.isError());
  errorMessage = computed(() => this._epubReader()?.errorMessage());

  chapters = computed(() => this._epubReader()?.chapters());
  currentChapterIndex = computed(() => this._epubReader()?.currentChapterIndex());

  constructor() {
    effect(() => {
      if (this.epubReader() && this._readerContent()) {
        this._epubReader.set(this.epubReader()!);
        this._epubReader()?.renderTo.set(this._readerContent());
        this._epubReader()?.load();
      } else if (this.src() && this._readerContent()) {
        this._epubReader()?.src.set(this.src()!);
        this._epubReader()?.renderTo.set(this._readerContent());
        this._epubReader()?.load();
      } else if (!this.epubReader() && !this.src()) {
        this._epubReader()?.src.set(null);
        this._epubReader()?.renderTo.set(null);
        this._epubReader()?.unload();
      }
    });
    effect(() => {
      if (this.styles()) {
        this._epubReader()?.styles.set(this.styles()!);
        this._epubReader()?.updateStyles();
      } else {
        this._epubReader()?.styles.set(null);
        this._epubReader()?.updateStyles();
      }
    });
    effect(() => {
      if (this._readerContent() && (this.fixedContentWidth() || this.fixedContentHeight())) {
        if (this.fixedContentWidth()) {
          this._readerContent()?.style.setProperty('width', `${this.fixedContentWidth()}px`);
          this._readerContent()?.style.setProperty('min-width', `${this.fixedContentWidth()}px`);
          this._readerContent()?.style.setProperty('max-width', `${this.fixedContentWidth()}px`);
        } else {
          this._readerContent()?.style.removeProperty('width');
          this._readerContent()?.style.removeProperty('min-width');
          this._readerContent()?.style.removeProperty('max-width');
        }
        if (this.fixedContentHeight()) {
          this._readerContent()?.style.setProperty('height', `${this.fixedContentHeight()}px`);
          this._readerContent()?.style.setProperty('min-height', `${this.fixedContentHeight()}px`);
          this._readerContent()?.style.setProperty('max-height', `${this.fixedContentHeight()}px`);
        } else {
          this._readerContent()?.style.removeProperty('height');
          this._readerContent()?.style.removeProperty('min-height');
          this._readerContent()?.style.removeProperty('max-height');
        }
        this._epubReader()?.updateResize();
      } else if (this._readerContent()) {
        this._readerContent()?.style.removeProperty('width');
        this._readerContent()?.style.removeProperty('height');
        this._readerContent()?.style.removeProperty('min-width');
        this._readerContent()?.style.removeProperty('min-height');
        this._readerContent()?.style.removeProperty('max-width');
        this._readerContent()?.style.removeProperty('max-height');
        this._epubReader()?.updateResize();
      }
    });
  }

  ngOnDestroy() {
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
