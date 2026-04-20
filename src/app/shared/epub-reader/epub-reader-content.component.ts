import { Component, input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-epub-reader-content',
  imports: [CommonModule],
  templateUrl: './epub-reader-content.component.html',
  encapsulation: ViewEncapsulation.ShadowDom
})
export class EpubReaderContentComponent {
  currentChapterContent = input.required<SafeHtml>();
}
