import { afterNextRender, Component, effect, inject, Injector, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Header } from './shared/header/header';
import { Body } from './shared/body/body';
import { AudioPlayer } from './shared/audio-player/audio-player';
import { Toaster } from './shared/toaster/toaster';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import { filter } from 'rxjs';
import { Dialog } from './shared/dialog/dialog';
import { DialogService } from './core/services/dialog.service';
import { ViewportScroller } from '@angular/common';
import { ToasterService } from './core/services/toaster.service';
import { EBookReader } from './shared/e-book-reader/e-book-reader';
import { AudioPlayerService } from './core/services/audio-player.service';
import { EBookReaderService } from './core/services/e-book-reader.service';

@Component({
  selector: 'app-root',
  imports: [Header, Body, AudioPlayer, EBookReader, Toaster, Dialog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private injector = inject(Injector);
  private router = inject(Router);
  private viewportScroller = inject(ViewportScroller);
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private audioPlayerService = inject(AudioPlayerService);
  private rBookReaderService = inject(EBookReaderService);

  @ViewChild(Header) header!: Header;
  @ViewChild(AudioPlayer) audioPlayer!: AudioPlayer;
  @ViewChild(EBookReader) eBookReader!: EBookReader;

  constructor() {
    // manage audio player and e book reader visualization
    effect(() => {
      if (this.audioPlayerService.currentTrack()) {
        this.rBookReaderService.destroyReader();
      }
    });
    effect(() => {
      if (this.rBookReaderService.currentEBook()) {
        this.audioPlayerService.stop();
      }
    });
    // body overflow hidden when open file reader or dialogs
    effect(() => {
      if (this.eBookReader?.isOpen() || this.dialogService?.dialog().visible) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });

    // close all opened ui on navigation
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.header.menuMobileOpen.set(false);
      this.audioPlayer.queueOpen.set(false);
      this.eBookReader.isOpen.set(false);
      this.dialogService.close(null);
    });

    // Restore scroll after rendering.
    this.router.events.pipe(
      filter((e) => e instanceof Scroll),
      takeUntilDestroyed()
    ).subscribe((e) => {
      afterNextRender(() => {
        if (e.position && (e.position[0] > 0 || e.position[1] > 0)) {
          this.viewportScroller.scrollToPosition(e.position);
        } else if (e.anchor) {
          this.viewportScroller.scrollToAnchor(e.anchor);
        }
      }, { injector: this.injector });
    });

    // check cookie enabled
    if (!this.checkCookie()) {
      this.toasterService.show($localize`Please enable cookies to use all features of this application.`, { type: 'warning', duration: 5000 });
    }

    // check offline
    window.addEventListener('online', () => this.toasterService.show($localize`You are back online.`, { type: 'success', duration: 5000 }));
    window.addEventListener('offline', () => this.toasterService.show($localize`You are Offline. You will be able to see only Offline content.`, { type: 'warning', duration: 5000 }));
  }

  private checkCookie() {
    // Quick test if browser has cookieEnabled host property
    if (!navigator.cookieEnabled) return false;
    // Create cookie
    try {
      document.cookie = "cookietest=1";
      var ret = document.cookie.indexOf("cookietest=") != -1;
      // Delete cookie
      document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
      return ret;
    } catch (e) {
      return false;
    }
  }
}
