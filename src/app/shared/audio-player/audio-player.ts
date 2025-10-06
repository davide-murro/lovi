import { Component, inject, signal } from '@angular/core';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faClose, faForward, faPause, faPlay, faShare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-audio-player',
  imports: [FontAwesomeModule, RouterLink],
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.scss'
})
export class AudioPlayer {
  audioPlayerService = inject(AudioPlayerService);

  faPlay = faPlay;
  faPause = faPause;
  faBackward = faBackward;
  faForward = faForward;
  faTrash = faTrash;
  faShare = faShare;
  faClose = faClose;

  queueOpen = signal(false);

  private wasPlayingBeforeSeek = signal(false);

  // Called on mousedown (desktop) or touchstart (mobile).
  onSeekingStart() {
    this.wasPlayingBeforeSeek.set(this.audioPlayerService.isPlaying());
    this.audioPlayerService.pause(); 
  }

  // Called on input.
  onSeeking(value: number) {
    this.audioPlayerService.seek(value);
  }

  // Called on mouseup (desktop) or touchend (mobile).
  onSeekingEnd() {
    if (this.wasPlayingBeforeSeek()) {
      this.audioPlayerService.play();
    }
    this.wasPlayingBeforeSeek.set(false);
  }

  // Utility function to format seconds into int value
  formatIntValue(seconds: number): number {
    return Math.floor(seconds);
  }
  // Utility function to format seconds into MM:SS
  formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedSeconds = String(remainingSeconds).padStart(2, '00');
    return `${minutes}:${formattedSeconds}`;
  }
}
