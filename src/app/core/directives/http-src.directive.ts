import { Directive, ElementRef, inject, Input, OnDestroy, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Directive({
  selector: 'img[httpSrc], audio[httpSrc], video[httpSrc], source[httpSrc]'
})
export class HttpSrcDirective implements OnDestroy {
  private el = inject(ElementRef);
  private http = inject(HttpClient);
  private renderer = inject(Renderer2);
  private subscription?: Subscription;
  private objectUrl?: string;

  @Input() set httpSrc(url: string | null | undefined) {
    this.updateSrc(url);
  }

  private updateSrc(url: string | null | undefined) {
    this.cleanup();

    if (!url) {
      this.renderer.removeAttribute(this.el.nativeElement, 'src');
      return;
    }

    this.subscription = this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.objectUrl = URL.createObjectURL(blob);
        this.renderer.setAttribute(this.el.nativeElement, 'src', this.objectUrl);
      },
      error: (err) => {
        console.error(url, err);
        this.renderer.removeAttribute(this.el.nativeElement, 'src');
      }
    });
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
