import { Component, inject, ViewChild } from '@angular/core';
import { Header } from './shared/header/header';
import { Body } from "./shared/body/body";
import { AudioPlayer } from "./shared/audio-player/audio-player";
import { Toaster } from './shared/toaster/toaster';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Dialog } from './shared/dialog/dialog';
import { DialogService } from './core/services/dialog.service';

@Component({
  selector: 'app-root',
  imports: [
    Header,
    Body,
    AudioPlayer,
    Toaster,
    Dialog
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);
  private dialogService = inject(DialogService);

  @ViewChild(Header) header!: Header;
  @ViewChild(AudioPlayer) audioPlayer!: AudioPlayer;

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.header.menuMobileOpen.set(false);
        this.audioPlayer.queueOpen.set(false);
        this.dialogService.close(null);
      });
  }

}
