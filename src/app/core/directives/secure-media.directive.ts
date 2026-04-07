import { Directive, ElementRef, OnChanges, SimpleChanges, inject, Renderer2, HostListener, input, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { OfflineUrlPipe } from '../pipes/offline-url.pipe';
import { AuthUrlPipe } from '../pipes/auth-url.pipe';

const EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

@Directive({
  selector: 'img[secureSrc], audio[secureSrc]'
})
export class SecureMediaDirective implements OnChanges {
  secureSrc = input<string | null | undefined>();
  secureOffline = input<boolean>(false);
  secureAuth = input<boolean>(false);

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private authService = inject(AuthService);
  private authUrlPipe = inject(AuthUrlPipe);
  private offlineUrlPipe = inject(OfflineUrlPipe);

  private hasRetried = signal(false);
  private tagName = signal(this.el.nativeElement.tagName.toLowerCase());

  ngOnChanges(changes: SimpleChanges) {
    if (changes['secureSrc']) {
      this.hasRetried.set(false);
      this.clearMedia();

      setTimeout(() => this.loadMedia());
    }
  }

  private loadMedia() {
    if (!this.secureSrc()) {
      this.clearMedia();
      return;
    }

    let url = this.secureSrc()!;

    // Direct passthrough for blobs and data uris
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      this.renderer.setAttribute(this.el.nativeElement, 'src', url);
      return;
    }

    if (this.secureOffline()) {
      const offlineUrl = this.offlineUrlPipe.transform(url);
      if (offlineUrl && offlineUrl !== url) {
        url = offlineUrl;
      }
    } else if (this.secureAuth()) {
      const authUrl = this.authUrlPipe.transform(url);
      if (authUrl) {
        url = authUrl;
      }
    }

    this.renderer.setAttribute(this.el.nativeElement, 'src', url);
  }

  private clearMedia() {
    if (this.tagName() === 'img') {
      // Transparent 1x1 pixel gif to clear broken image icons
      this.renderer.setAttribute(
        this.el.nativeElement,
        'src',
        EMPTY_IMAGE
      );
    } else if (this.tagName() === 'audio') {
      this.renderer.removeAttribute(this.el.nativeElement, 'src');
    }
  }

  @HostListener('canplay', ['$event'])
  onCanplay(event: Event) {
    this.hasRetried.set(false);
  }

  @HostListener('error', ['$event'])
  async onError(event: Event) {
    if (!this.secureSrc() || this.secureSrc()!.startsWith('blob:') || this.secureSrc()!.startsWith('data:')) {
      this.clearMedia();
      return;
    }

    // Try refreshing the token once
    if (!this.hasRetried() && this.secureAuth() && this.authService.isLoggedIn()) {
      this.hasRetried.set(true);
      const currentTime = this.tagName() === 'audio' ? this.el.nativeElement.currentTime : 0;

      try {
        await firstValueFrom(this.authService.refreshTokens());
        // Reloads the URL. The authUrlPipe will pick up the freshly minted token.
        this.loadMedia();

        if (this.tagName() === 'audio') {
          this.el.nativeElement.currentTime = currentTime;
        }
        return;
      } catch (e) { }
    }

    // Failed after retry or could not try again
    this.clearMedia();
  }
}
