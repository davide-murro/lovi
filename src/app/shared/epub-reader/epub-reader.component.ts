import { Component, computed, effect, ElementRef, input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight, faCircleNotch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { EpubReader } from './epub-reader';
import { EpubReaderContentComponent } from './epub-reader-content.component';
import { EpubReaderThemeStyle } from './epub-reader-theme-style.model';

@Component({
  selector: 'app-epub-reader',
  imports: [CommonModule, FontAwesomeModule, EpubReaderContentComponent],
  providers: [EpubReader],
  templateUrl: './epub-reader.component.html',
  styleUrl: './epub-reader.component.scss',
})
export class EpubReaderComponent {
  @ViewChild('readerContentWrapper') readerContentWrapper!: ElementRef;

  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faCircleNotch = faCircleNotch;
  faExclamationTriangle = faExclamationTriangle;

  // inputs
  src = input.required<string>();
  themeStyles = input.required<EpubReaderThemeStyle>();

  // private readonly signals
  private _epubReader = new EpubReader();

  // public readonly signals
  chapters = computed(() => this._epubReader.chapters());
  currentChapterIndex = computed(() => this._epubReader.currentChapterIndex());
  currentChapterContent = computed(() => this._epubReader.currentChapterContent());
  isLoading = computed(() => this._epubReader.isLoading());
  isError = computed(() => this._epubReader.isError());

  constructor() {
    effect(() => {
      if (this.src()) {
        this._epubReader.src.set(this.src());
        this._epubReader.load();
      } else {
        this._epubReader.unload();
      }
    });
    effect(() => {
      if (this.currentChapterContent() && this.currentChapterIndex() >= 0) {
        this.scrollToTop();
      }
    });
  }


  private scrollToTop() {
    const scrollContainer = this.readerContentWrapper?.nativeElement;
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }


  async onChapterInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (!isNaN(value)) {
      await this._epubReader.goToChapter(value - 1);
    }
  }

  async onPrevChapter() {
    await this._epubReader.prevChapter();
  }

  async onNextChapter() {
    await this._epubReader.nextChapter();
  }
}
