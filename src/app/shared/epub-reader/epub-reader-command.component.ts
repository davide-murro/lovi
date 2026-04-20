import { Component, effect, ElementRef, input, output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight, faCircleNotch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FileBook } from '../../core/models/file-book.model';
import { NavItem } from '@intity/epub-js';
import { SafeHtml } from '@angular/platform-browser';
import { EpubReaderContentComponent } from './epub-reader-content.component';
import { EpubReaderThemeStyle } from './epub-reader-theme-style.model';

@Component({
  selector: 'app-epub-reader-command',
  imports: [CommonModule, FontAwesomeModule, EpubReaderContentComponent],
  templateUrl: './epub-reader.component.html',
  styleUrl: './epub-reader.component.scss',
})
export class EpubReaderCommandComponent {
  @ViewChild('readerContentWrapper') readerContentWrapper!: ElementRef;

  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faCircleNotch = faCircleNotch
  faExclamationTriangle = faExclamationTriangle;

  // inputs
  currentFileBook = input.required<FileBook>();
  chapters = input.required<NavItem[]>();
  currentChapterIndex = input.required<number>();
  currentChapterContent = input.required<SafeHtml>();
  isLoading = input.required<boolean>();
  isError = input.required<boolean>();

  themeStyles = input<EpubReaderThemeStyle>();

  // outputs
  prevChapter = output<void>();
  nextChapter = output<void>();
  goToChapter = output<number>();


  constructor() {
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

  onPrevChapter() {
    this.prevChapter.emit();
  }

  onNextChapter() {
    this.nextChapter.emit();
  }

  onChapterInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (!isNaN(value)) {
      this.goToChapter.emit(value - 1);
    }
  }

}
