import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faCircleHalfStroke, faClose, faTextHeight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FileBookReaderService } from '../../core/services/file-book-reader.service';
import { SecureMediaDirective } from '../../core/directives/secure-media.directive';
import { EpubReaderComponent } from '../epub-reader/epub-reader.component';

@Component({
  selector: 'app-file-book-reader',
  imports: [CommonModule, FontAwesomeModule, SecureMediaDirective, EpubReaderComponent],
  templateUrl: './file-book-reader.html',
  styleUrl: './file-book-reader.scss'
})
export class FileBookReader {
  fileBookReaderService = inject(FileBookReaderService);

  faChevronDown = faChevronDown;
  faClose = faClose;
  faCircleHalfStroke = faCircleHalfStroke;
  faTextHeight = faTextHeight;

  // Avoid triggering on mobile address bar show/hide
  // We only update if the width changes (orientation or desktop resize)
  readerFixedContentSize = signal(this.calculateContentSize());
  @HostListener('window:resize')
  onResize() { this.readerFixedContentSize.set(this.calculateContentSize()); }

  readerVisible = signal<boolean>(false);
  isOpen = signal<boolean>(false);
  themeInputOpen = signal<boolean>(false);
  themeValue = signal<number>(50); // Default to sepia
  fontSizeInputOpen = signal<boolean>(false);
  fontSizeValue = signal<number>(16); // Default font size in px

  readerStyles = computed(() => {
    const val = this.themeValue();
    const fontSize = this.fontSizeValue();

    let bg;

    if (val <= 50) {
      bg = this.interpolateColor('#121212', '#f4ecd8', val / 50);
    } else {
      bg = this.interpolateColor('#f4ecd8', '#ffffff', (val - 50) / 50);
    }

    const color = this.getReadableTextColor(bg);

    return {
      background: bg,
      color: color,
      'font-size': fontSize + 'px'
    };
  });

  constructor() {
    effect(() => {
      if (this.fileBookReaderService.currentFileBook() != null) {
        this.readerVisible.set(true);
        this.isOpen.set(true);
      } else {
        this.readerVisible.set(false);
        this.isOpen.set(false);
      }
    });
  }

  private calculateContentSize(): { width: number, height: number } {
    const isSm = window.innerWidth >= 640;
    let windowWidth: number;
    let windowHeight: number;

    if (typeof document === 'undefined') {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
    } else {
      // get smallest width and height can be the viewport using css (also mobile)
      const div = document.createElement('div');
      div.style.width = '100svw';
      div.style.height = '100svh';
      div.style.visibility = 'hidden';
      div.style.position = 'fixed';
      div.style.inset = '0';
      document.body.appendChild(div);
      windowWidth = div.offsetWidth;
      windowHeight = div.offsetHeight;
      document.body.removeChild(div);
    }

    // remove padding and header
    const widthOffsetRem = isSm ? 4 : 0;
    const widthOffsetPx = widthOffsetRem * 16;
    const w = windowWidth - widthOffsetPx;

    const heightOffsetRem = isSm ? 5.5 : 4.5;
    const heightOffsetPx = heightOffsetRem * 16 * 2;
    const h = windowHeight - heightOffsetPx;

    // snap to nearest 10px (defect)
    const snappedWidth = Math.floor(w / 10) * 10;
    const snappedHeight = Math.floor(h / 10) * 10;

    return { width: snappedWidth, height: snappedHeight };
  }

  private interpolateColor(color1: string, color2: string, ratio: number): string {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return `rgb(${r}, ${g}, ${b})`;
  }
  private getReadableTextColor(bg: string): string {
    const [r, g, b] = bg.match(/\d+/g)!.map(Number);

    // convert to sRGB
    const srgb = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928
        ? v / 12.92
        : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    const luminance =
      0.2126 * srgb[0] +
      0.7152 * srgb[1] +
      0.0722 * srgb[2];

    return luminance > 0.5 ? '#121212' : '#ffffff';
  }

  toggleThemeInput() {
    this.themeInputOpen.set(!this.themeInputOpen());
    this.fontSizeInputOpen.set(false);
  }

  toggleFontSizeInput() {
    this.fontSizeInputOpen.set(!this.fontSizeInputOpen());
    this.themeInputOpen.set(false);
  }

  onThemeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.themeValue.set(parseInt(input.value));
  }

  onFontSizeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fontSizeValue.set(parseInt(input.value));
  }
}
