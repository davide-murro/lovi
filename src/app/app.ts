import { Component, effect, inject, ViewChild } from '@angular/core';
import { Header } from './shared/header/header';
import { Body } from "./shared/body/body";
import { Footer } from "./shared/footer/footer";
import { AudioPlayer } from "./shared/audio-player/audio-player";
import { Toaster } from './shared/toaster/toaster';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Dialog } from './shared/dialog/dialog';

@Component({
  selector: 'app-root',
  imports: [
    Header,
    Body,
    Footer,
    AudioPlayer,
    Toaster,
    Dialog
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);

  @ViewChild(Header) header!: Header;
  @ViewChild(AudioPlayer) audioPlayer!: AudioPlayer;

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.header.menuMobileOpen.set(false);
        this.audioPlayer.queueOpen.set(false);
      });
  }

}
