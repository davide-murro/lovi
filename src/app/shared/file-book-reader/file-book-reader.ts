import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faCircleHalfStroke, faTextHeight, faTrash } from '@fortawesome/free-solid-svg-icons';
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
  faTrash = faTrash;
  faCircleHalfStroke = faCircleHalfStroke;
  faTextHeight = faTextHeight;

  readerVisible = signal<boolean>(false);
  isOpen = signal<boolean>(false);
  themeInputOpen = signal<boolean>(false);
  themeValue = signal<number>(50); // Default to sepia
  fontSizeInputOpen = signal<boolean>(false);
  fontSizeValue = signal<number>(16); // Default font size in px

  themeStyles = computed(() => {
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
