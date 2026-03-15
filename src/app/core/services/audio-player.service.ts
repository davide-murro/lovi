import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AudioTrack } from '../models/audio-track.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  private authService = inject(AuthService);

  private audio = new Audio();

  // Signals for state
  queue = signal<AudioTrack[]>([]);
  currentId = signal<number>(null!);
  idCounter = signal<number>(0);

  isPlaying = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isError = signal<boolean>(false);
  errorEvent = signal<any>(null);

  // Signals for Time/Seek
  currentTime = signal(0);
  duration = signal(0);

  // Computed signal: current track
  currentIndex = computed(() => {
    return this.queue().findIndex(t => t.id === this.currentId()) ?? null;
  });
  currentTrack = computed(() => {
    return this.queue().find(t => t.id === this.currentId()) ?? null;
  });
  previousTrack = computed(() => {
    if (this.currentIndex() > 0) {
      return this.queue()[this.currentIndex() - 1] ?? null;
    }
    return null
  });
  nextTrack = computed(() => {
    if (this.currentIndex() >= 0 && this.currentIndex() + 1 < this.queue()?.length) {
      return this.queue()[this.currentIndex() + 1] ?? null;
    }
    return null
  });

  constructor() {
    effect(() => {
      if (!this.authService.isLoggedIn()) this.removeAllQueue();
    });

    // Go to next when audio ends
    this.audio.addEventListener('ended', () => this.next());

    this.audio.addEventListener('play', () => {
      this.isPlaying.set(true);
      this.updatePlaybackState();
    });
    this.audio.addEventListener('pause', () => {
      this.isPlaying.set(false);
      this.currentTime.set(this.audio.currentTime); // Sync time on pause to ensure the UI is 100% accurate
      this.updatePlaybackState();
    });

    // Listen for time updates and duration
    const syncTime = () => {
      if (isFinite(this.audio.currentTime)) {
        this.currentTime.set(this.audio.currentTime);
        this.updatePositionState();
      }
    };

    const syncDuration = () => {
      if (isFinite(this.audio.duration)) {
        this.duration.set(this.audio.duration);
        this.updatePositionState();
        this.updatePlaybackState();
      }
    };

    this.audio.addEventListener('timeupdate', syncTime);
    this.audio.addEventListener('seeking', syncTime);
    this.audio.addEventListener('seeked', syncTime);

    this.audio.addEventListener('loadedmetadata', syncDuration);
    this.audio.addEventListener('durationchange', syncDuration);

    // start loading
    this.audio.addEventListener('loadstart', () => {
      this.isLoading.set(true);
    });

    // buffering
    this.audio.addEventListener('waiting', () => {
      this.isLoading.set(true);
    });

    // playable again
    this.audio.addEventListener('canplay', () => {
      this.isLoading.set(false);
      this.isError.set(false);
      this.errorEvent.set(null);
    });

    // error
    this.audio.addEventListener('error', (event) => {
      this.isLoading.set(false);
      this.isError.set(true);
      this.errorEvent.set(event);
      this.isPlaying.set(false);
    });

    // set media session for smartphones
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) this.seek(details.seekTime);
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seek(this.audio.currentTime - skipTime);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seek(this.audio.currentTime + skipTime);
      });
    }
  }

  private loadAudio(track: AudioTrack) {
    this.audio.pause();
    this.audio.src = track?.audioSrc;
    this.loadAudioMetadata(track);
    this.currentTime.set(0);
    this.duration.set(0);
  }
  private clearAudio() {
    this.audio.pause();
    this.audio.removeAttribute('src'); // remove src attribute entirely
    this.audio.load(); // reset the element
    this.clearMediaSession();
    this.currentTime.set(0);
    this.duration.set(0);
  }
  private loadAudioMetadata(track: AudioTrack) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track?.subtitle ? `${track?.title} - ${track?.subtitle}` : track?.title,
        artist: track?.artists?.join(", "),
        artwork: [
          { src: track?.coverImageSrc!, sizes: '512x512', type: 'image/png' },
        ]
      });
    }
  }
  private updatePositionState() {
    if (
      'mediaSession' in navigator &&
      'setPositionState' in navigator.mediaSession &&
      this.audio.readyState >= 2 // HAVE_CURRENT_DATA or higher
    ) {
      navigator.mediaSession.setPositionState({
        duration: this.duration(),
        playbackRate: this.audio.playbackRate,
        position: this.currentTime()
      });
    }
  }
  private updatePlaybackState() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = this.isPlaying() ? 'playing' : 'paused';
    }
  }
  private clearMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    }
  }

  loadId(id: number) {
    this.currentId.set(id);
    const track = this.currentTrack();
    if (track) {
      this.loadAudio(track);
      this.pause();
    }
  }

  togglePlay() {
    if (this.isPlaying()) this.pause();
    else this.play();
  }
  play() {
    if (this.isError()) {
      this.audio.load();
      this.audio.currentTime = this.currentTime();
    }
    this.audio.play();
  }
  playId(id: number) {
    this.currentId.set(id);
    const track = this.currentTrack();
    if (track) {
      this.loadAudio(track);
      this.play();
    }
  }
  playTrack(track: AudioTrack, newQueue: AudioTrack[] = []) {
    // If queue doesn't already contain this track, prepend it
    if (!newQueue.find(t => t.audioSrc === track.audioSrc)) {
      newQueue = [track, ...newQueue];
    }

    // prepare new queue
    let idCounter = this.idCounter();
    newQueue = newQueue.map(t => {
      idCounter = idCounter + 1;
      t = structuredClone({ ...t, id: idCounter });
      return t;
    });

    // If queue doesn't already contain this track, prepend it
    const playTrack = newQueue.find(t => t.audioSrc === track?.audioSrc)!;

    // set signals
    this.idCounter.set(idCounter);
    this.queue.set(newQueue);
    this.playId(playTrack.id);
  }

  restartQueue() {
    const q = this.queue();
    if (q.length > 0) {
      this.playId(q[0].id);
      this.seek(0);
    }
  }


  pause() {
    this.audio.pause();
  }

  stop() {
    this.pause();
    this.clearAudio();
    this.currentId.set(null!);
  }

  next() {
    if (this.nextTrack() != null) {
      this.playId(this.nextTrack()!.id);
    } else {
      this.seek(this.audio.duration);
      this.pause();
    }
  }

  previous() {
    if (this.audio.currentTime > 5) {
      this.seek(0);
    } else if (this.previousTrack() != null) {
      this.playId(this.previousTrack()!.id);
    } else {
      this.seek(0);
    }
  }

  addToQueue(track: AudioTrack) {
    const id = this.idCounter() + 1;
    track = structuredClone({ ...track, id: id });

    this.idCounter.set(id);
    this.queue.update(q => [...q, track]);

    // set current if doesn t exists
    if (this.currentId() == null) {
      this.loadId(track.id);
    }
  }

  removeFromQueue(id: number) {
    this.queue.update(q => q.filter(t => t.id !== id));

    if (this.currentId() === id) {
      // auto-play next if available, otherwise stop
      const q = this.queue();
      if (q.length > 0) {
        this.loadId(q[0].id);
      } else {
        this.stop();
      }
    }
  }

  removeAllQueue() {
    this.queue.set([]);
    this.stop();
  }

  seek(time: number) {
    if (this.isError()) {
      this.audio.load();
    }
    this.audio.currentTime = time;
    this.currentTime.set(time); // Sync immediately to prevent UI glitch on release
  }

  isInQueueAudioSrc(audioSrc: string): boolean {
    return this.queue().some(q => q.audioSrc === audioSrc);
  }
  isCurrentAudioSrc(audioSrc: string): boolean {
    return this.currentTrack()?.audioSrc === audioSrc;
  }
  isCurrentPlayingAudioSrc(audioSrc: string): boolean {
    return this.isCurrentAudioSrc(audioSrc) && this.isPlaying();
  }
  isCurrentLoadingAudioSrc(audioSrc: string): boolean {
    return this.isCurrentAudioSrc(audioSrc) && this.isLoading();
  }
}
