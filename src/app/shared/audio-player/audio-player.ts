import { Component, computed, effect, inject, signal } from '@angular/core';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faBackwardStep, faCircleNotch, faClose, faForward, faPause, faPlay, faRotateLeft, faShare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { ToasterService } from '../../core/services/toaster.service';
import { Subscription } from 'rxjs';
import { SecureMediaDirective } from '../../core/directives/secure-media.directive';

@Component({
  selector: 'app-audio-player',
  imports: [FontAwesomeModule, RouterLink, SecureMediaDirective],
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

  bufferedSegments = computed(() => {
    const duration = this.audioPlayerService.duration();
    if (duration <= 0) return [];

    return this.audioPlayerService.buffered().map(range => ({
      left: (range.start / duration) * 100,
      width: ((range.end - range.start) / duration) * 100
    }));
  });

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
    this.isSeeking.set(true);
    this.seekingTime.set(this.audioPlayerService.currentTime());
  }

  // Called on input.
  onSeeking(value: number) {
    this.seekingTime.set(value);
    if (!this.isSeeking()) {
      this.audioPlayerService.seek(value);
    }
  }

  // Called on mouseup (desktop) or touchend (mobile).
  onSeekingEnd() {
    this.audioPlayerService.seek(this.seekingTime());
    this.isSeeking.set(false);
    this.seekingTime.set(0);
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

  // Toggle playback rate between 1x, 2x, and 0.5x
  toggleSpeed() {
    const currentRate = this.audioPlayerService.playbackRate();
    let nextRate = 1;

    if (currentRate === 1) nextRate = 2;
    else if (currentRate === 2) nextRate = 0.5;
    else nextRate = 1;

    this.audioPlayerService.setPlaybackRate(nextRate);
  }
}
