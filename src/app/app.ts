import { Component, effect, inject, NgZone, ViewChild } from '@angular/core';
import { Header } from './shared/header/header';
import { Body } from './shared/body/body';
import { AudioPlayer } from './shared/audio-player/audio-player';
import { Toaster } from './shared/toaster/toaster';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import { filter, take } from 'rxjs';
import { Dialog } from './shared/dialog/dialog';
import { DialogService } from './core/services/dialog.service';
import { ViewportScroller } from '@angular/common';
import { ToasterService } from './core/services/toaster.service';
import { FileBookReader } from './shared/file-book-reader/file-book-reader';
import { AudioPlayerService } from './core/services/audio-player.service';
import { FileBookReaderService } from './core/services/file-book-reader.service';

@Component({
  selector: 'app-root',
  imports: [Header, Body, AudioPlayer, FileBookReader, Toaster, Dialog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private zone = inject(NgZone);
  private router = inject(Router);
  private viewportScroller = inject(ViewportScroller);
  private dialogService = inject(DialogService);
  private toasterService = inject(ToasterService);
  private audioPlayerService = inject(AudioPlayerService);
  private fileBookReaderService = inject(FileBookReaderService);

  @ViewChild(Header) header!: Header;
  @ViewChild(AudioPlayer) audioPlayer!: AudioPlayer;
  @ViewChild(FileBookReader) fileBookReader!: FileBookReader;

  constructor() {
    // manage audio player and file book reader visualization
    effect(() => {
      if (this.audioPlayerService.currentTrack()) {
        this.fileBookReaderService.destroyReader();
      }
    });
    effect(() => {
      if (this.fileBookReaderService.currentFileBook()) {
        this.audioPlayerService.stop();
      }
    });
    // body overflow hidden when i open file reader, dialogs and selectors
    effect(() => {
      if (this.fileBookReader?.isOpen() || this.dialogService?.dialog().visible) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });

    // close all opened ui on navigation
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.header.menuMobileOpen.set(false);
      this.audioPlayer.queueOpen.set(false);
      this.fileBookReader.isOpen.set(false);
      this.dialogService.close(null);
    });

    // handle navigation scroll
    this.router.events.pipe(filter((e) => e instanceof Scroll)).subscribe((e) => {
      this.zone.onStable.pipe(take(1)).subscribe(() => {
        if (e.position && (e.position[0] > 0 || e.position[1] > 0)) {
          this.viewportScroller.scrollToPosition(e.position);
        } else if (e.anchor) {
          this.viewportScroller.scrollToAnchor(e.anchor);
        }
      });
    });

    // check cookie enabled
    if (!this.checkCookie()) {
      this.toasterService.show('Please enable cookies to use all features of this application.', { type: 'warning', duration: 5000 });
    }

    // check offline
    window.addEventListener('online', () => this.toasterService.show('You are back online.', { type: 'success', duration: 5000 }));
    window.addEventListener('offline', () => this.toasterService.show('You are Offline. You will be able to see only Offline content.', { type: 'warning', duration: 5000 }));
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
