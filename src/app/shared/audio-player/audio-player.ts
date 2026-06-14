import { Component, computed, effect, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faBackwardStep, faChevronDown, faCircleNotch, faForward, faGripLines, faPause, faPlay, faRotateLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ToasterService } from '../../core/services/toaster.service';
import { Subscription } from 'rxjs';
import { SecureMediaDirective } from '../../core/directives/secure-media.directive';
import { CdkDragDrop, CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-audio-player',
  imports: [FontAwesomeModule, SecureMediaDirective, DragDropModule],
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.scss'
})
export class AudioPlayer {
  audioPlayerService = inject(AudioPlayerService);
  toasterService = inject(ToasterService);

  playPauseTitle = computed(() =>
    this.audioPlayerService.isPlaying()
      ? $localize`Pause`
      : $localize`Play`
  );

  faPlay = faPlay;
  faPause = faPause;
  faBackward = faBackward;
  faBackwardStep = faBackwardStep;
  faForward = faForward;
  faTrash = faTrash;
  faGripLines = faGripLines;
  faChevronDown = faChevronDown;
  faRotateLeft = faRotateLeft;
  faCircleNotch = faCircleNotch;

  // Drag-scroll state
  @ViewChild('cdkBoundary', { static: false })
  private cdkBoundary?: ElementRef<HTMLElement>;

  private dragScrollRaf?: number;
  private dragScrollDir = 0; // -1 up, 1 down, 0 stop
  private dragScrollThreshold = 50; // px from edge to start scrolling
  // smooth speed parameters (px per frame)
  private dragScrollMinSpeed = 1;
  private dragScrollMaxSpeed = 14;
  private dragPointerY?: number;

  playerVisible = signal(false);
  queueOpen = signal(false);
  isReordering = signal(false);

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
    });

    // error handling
    this.audioPlayerErrorSubscription = this.audioPlayerService.errorEvent$.subscribe((event) => {
      console.error('audioPlayerService.errorEvent', event);
      this.toasterService.show('Error playing audio', { type: 'error', duration: 5000 });
    });
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


  // on drag start
  onTrackDragStart() {
    this.isReordering.set(true);
  }
  // on drag end
  onTrackDragEnd() {
    // stop any running drag-scroll loop immediately
    if (this.dragScrollRaf) {
      cancelAnimationFrame(this.dragScrollRaf);
      this.dragScrollRaf = undefined;
    }
    this.dragScrollDir = 0;
    this.dragPointerY = undefined;

    requestAnimationFrame(() => {
      this.isReordering.set(false);
    });
  }
  // on drop
  onTrackDrop(event: CdkDragDrop<any[]>) {
    this.audioPlayerService.reorderQueue(event.previousIndex, event.currentIndex);
  }

  // on drag move
  // made this to autoscroll to fix the issue in cdk auto scroll
  onTrackDragMoved(event: CdkDragMove) {
    const pointerY = event.pointerPosition?.y ?? 0;
    this.dragPointerY = pointerY;
    const rect = this.cdkBoundary?.nativeElement.getBoundingClientRect();
    if (!rect) return;

    const distanceToTop = pointerY - rect.top;
    const distanceToBottom = rect.bottom - pointerY;

    let newDir = 0;
    if (distanceToTop >= 0 && distanceToTop <= this.dragScrollThreshold) {
      newDir = -1;
    } else if (distanceToBottom >= 0 && distanceToBottom <= this.dragScrollThreshold) {
      newDir = 1;
    }

    if (newDir !== this.dragScrollDir) {
      this.dragScrollDir = newDir;
      if (this.dragScrollDir === 0) {
        if (this.dragScrollRaf) {
          cancelAnimationFrame(this.dragScrollRaf);
          this.dragScrollRaf = undefined;
        }
      } else {
        // start continuous scrolling loop
        const step = () => {
          if (!this.cdkBoundary || this.dragScrollDir === 0) {
            if (this.dragScrollRaf) {
              cancelAnimationFrame(this.dragScrollRaf);
              this.dragScrollRaf = undefined;
            }
            return;
          }

          // compute dynamic speed based on current pointer distance to edge
          const bounds = this.cdkBoundary!.nativeElement.getBoundingClientRect();
          const ptrY = this.dragPointerY ?? (bounds.top + bounds.height / 2);
          const distTop = Math.max(0, ptrY - bounds.top);
          const distBottom = Math.max(0, bounds.bottom - ptrY);
          const distance = this.dragScrollDir === -1 ? distTop : distBottom;

          let ratio = 0;
          if (distance <= this.dragScrollThreshold) {
            ratio = (this.dragScrollThreshold - distance) / this.dragScrollThreshold;
            ratio = Math.max(0, Math.min(1, ratio));
          }

          const currentSpeed = this.dragScrollMinSpeed + ratio * (this.dragScrollMaxSpeed - this.dragScrollMinSpeed);

          this.cdkBoundary!.nativeElement.scrollTop += this.dragScrollDir * currentSpeed;
          this.dragScrollRaf = requestAnimationFrame(step);
        };

        if (!this.dragScrollRaf) this.dragScrollRaf = requestAnimationFrame(step);
      }
    }
  }
  onTrackDragReleased() {
    // stop any running drag-scroll loop immediately
    if (this.dragScrollRaf) {
      cancelAnimationFrame(this.dragScrollRaf);
      this.dragScrollRaf = undefined;
    }
    this.dragScrollDir = 0;
    this.dragPointerY = undefined;
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

  // Toggle playback rate between 0.7x, 1x, 1.5x, and 2x
  toggleSpeed() {
    const currentRate = this.audioPlayerService.playbackRate();
    let nextRate = 1;

    if (currentRate === 1) nextRate = 1.5;
    else if (currentRate === 1.5) nextRate = 2;
    else if (currentRate === 2) nextRate = 0.7;
    else nextRate = 1;

    this.audioPlayerService.setPlaybackRate(nextRate);
  }
}
