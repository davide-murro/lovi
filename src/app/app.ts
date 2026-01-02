import { ApplicationRef, Component, inject, NgZone, ViewChild } from '@angular/core';
import { Header } from './shared/header/header';
import { Body } from './shared/body/body';
import { AudioPlayer } from './shared/audio-player/audio-player';
import { Toaster } from './shared/toaster/toaster';
import { NavigationEnd, NavigationStart, Router, Scroll } from '@angular/router';
import { filter, take } from 'rxjs';
import { Dialog } from './shared/dialog/dialog';
import { DialogService } from './core/services/dialog.service';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [Header, Body, AudioPlayer, Toaster, Dialog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private viewportScroller = inject(ViewportScroller);
  private applicationRef = inject(ApplicationRef);

  @ViewChild(Header) header!: Header;
  @ViewChild(AudioPlayer) audioPlayer!: AudioPlayer;

  constructor() {
    // close all opened ui
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.header.menuMobileOpen.set(false);
      this.audioPlayer.queueOpen.set(false);
      this.dialogService.close(null);
    });
    
    // handle navigation scroll
    this.router.events.pipe(filter((e) => e instanceof Scroll)).subscribe((e) => {
      this.applicationRef.isStable
        .pipe(
          filter((stable) => stable),
          take(1)
        )
        .subscribe(() => {
          if (e.position) {
            this.viewportScroller.scrollToPosition(e.position);
          } else if (e.anchor) {
            this.viewportScroller.scrollToAnchor(e.anchor);
          } else {
            this.viewportScroller.scrollToPosition([0, 0]);
          }
        });
    });
  }
}
