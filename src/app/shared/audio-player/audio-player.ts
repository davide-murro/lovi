import { Component, computed, effect, inject, signal } from '@angular/core';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faBackwardStep, faCircleNotch, faClose, faForward, faPause, faPlay, faRotateLeft, faShare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { HttpSrcDirective } from '../../core/directives/http-src.directive';
import { ToasterService } from '../../core/services/toaster.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audio-player',
  imports: [FontAwesomeModule, RouterLink, HttpSrcDirective],
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.scss'
})
export class AudioPlayer {
  audioPlayerService = inject(AudioPlayerService);
  toasterService = inject(ToasterService);

  faPlay = faPlay;
  faPause = faPause;
  faBackward = faBackward;
  faBackwardStep = faBackwardStep;
  faForward = faForward;
  faTrash = faTrash;
  faShare = faShare;
  faClose = faClose;
  faRotateLeft = faRotateLeft;
  faCircleNotch = faCircleNotch;

  playerVisible = signal(false);
  queueOpen = signal(false);

  displayTime = computed(() => this.isSeeking() ? this.seekingTime() : this.audioPlayerService.currentTime());
  displayDuration = computed(() => this.audioPlayerService.duration());

  private wasPlayingBeforeSeek = signal(false);
  private isSeeking = signal(false);
  private seekingTime = signal(0);

  private audioPlayerErrorSubscription?: Subscription;

  constructor() {
    effect(() => {
      if (this.audioPlayerService.currentTrack() != null) {
        this.playerVisible.set(true);
      } else {
        this.playerVisible.set(false);
        this.queueOpen.set(false);
      }
    })

    // error handling
    this.audioPlayerErrorSubscription = this.audioPlayerService.errorEvent$.subscribe((event) => {
      console.error('audioPlayerService.errorEvent', event);
      this.toasterService.show('Error playing audio', { type: 'error', duration: 5000 });
    })
  }

  ngOnDestroy() {
    this.audioPlayerErrorSubscription?.unsubscribe();
    this.audioPlayerErrorSubscription = undefined;
  }

  // Called on mousedown (desktop) or touchstart (mobile).
  onSeekingStart() {
    this.wasPlayingBeforeSeek.set(this.audioPlayerService.isPlaying());
    this.isSeeking.set(true);
    this.seekingTime.set(this.audioPlayerService.currentTime());
    this.audioPlayerService.pause();
  }

  // Called on input.
  onSeeking(value: number) {
    this.seekingTime.set(value);
    if (!this.isSeeking()) {
      this.audioPlayerService.seek(value, this.audioPlayerService.isPlaying());
    }
  }

  // Called on mouseup (desktop) or touchend (mobile).
  onSeekingEnd() {
    this.audioPlayerService.seek(this.seekingTime(), this.wasPlayingBeforeSeek());
    this.isSeeking.set(false);
    this.wasPlayingBeforeSeek.set(false);
  }

  // Utility function to format seconds into int value
  formatIntValue(seconds: number): number {
    return Math.floor(seconds);
  }
  // Utility function to format seconds into MM:SS
  formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // If more than 1 hour, show HH:MM:SS, otherwise MM:SS
    return hours > 0
      ? `${hours}:${formattedMinutes}:${formattedSeconds}`
      : `${minutes}:${formattedSeconds}`;
  }
}
