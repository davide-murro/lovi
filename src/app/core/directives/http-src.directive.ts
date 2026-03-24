import { Directive, effect, ElementRef, inject, input, Input, OnDestroy, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

const EMPTY = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='; // Empty image (1×1 transparent GIF)

@Directive({
  selector: 'img[httpSrc], audio[httpSrc], video[httpSrc], source[httpSrc]'
})
export class HttpSrcDirective implements OnDestroy {
  private el = inject(ElementRef);
  private http = inject(HttpClient);
  private renderer = inject(Renderer2);
  private subscription?: Subscription;
  private objectUrl?: string;

  httpSrc = input<string | null | undefined>();

  constructor() {
    effect(() => {
      this.updateSrc(this.httpSrc());
    });
  }

  private updateSrc(url: string | null | undefined) {
    this.cleanup();
    this.removeAttribute();

    if (!url) return;

    this.subscription = this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.objectUrl = URL.createObjectURL(blob);
        this.renderer.setAttribute(this.el.nativeElement, 'src', this.objectUrl);
      },
      error: (err) => {
        this.removeAttribute();
      }
    });
  }

  private removeAttribute() {
    if (this.el.nativeElement.tagName === 'IMG') {
      this.renderer.setAttribute(this.el.nativeElement, 'src', EMPTY);
    } else {
      this.renderer.removeAttribute(this.el.nativeElement, 'src');
    }
  }

  private cleanup() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = undefined;
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }
}
