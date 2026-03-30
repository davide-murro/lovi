import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AudioTrack } from '../models/audio-track.model';
import { AuthService } from './auth.service';
import { firstValueFrom, Subject } from 'rxjs';
import { OfflineUrlPipe } from '../pipes/offline-url.pipe';
import { AuthUrlPipe } from '../pipes/auth-url.pipe';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  private authService = inject(AuthService);
  private authUrlPipe = inject(AuthUrlPipe);
  private offlineUrlPipe = inject(OfflineUrlPipe);

  private audio = new Audio();

  // Signals for Queue
  queue = signal<AudioTrack[]>([]);
  currentId = signal<number | null>(null);
  idCounter = signal<number>(0);

  // Signals for Audio
  currentTime = signal(0);
  duration = signal(0);
  buffered = signal<{ start: number, end: number }[]>([]);

  isLoading = signal<boolean>(false);
  isPlaying = signal<boolean>(false);
  isError = signal<boolean>(false);

  private hasRetriedAfterError = signal(false);
  private _errorEvent$ = new Subject<any>();
  public readonly errorEvent$ = this._errorEvent$.asObservable();

  // Computed signal: current track
  currentIndex = computed(() => {
    const index = this.queue().findIndex(t => t.id === this.currentId());
    return index >= 0 ? index : null;
  });
  currentTrack = computed(() => {
    return this.queue().find(t => t.id === this.currentId()) ?? null;
  });
  previousTrack = computed(() => {
    if (this.currentIndex() != null && this.currentIndex()! > 0) {
      return this.queue()[this.currentIndex()! - 1] ?? null;
    }
    return null
  });
  nextTrack = computed(() => {
    if (this.currentIndex() != null && this.currentIndex()! + 1 < this.queue()?.length) {
      return this.queue()[this.currentIndex()! + 1] ?? null;
    }
    return null
  });

  constructor() {
    effect(() => {
      if (!this.authService.isLoggedIn()) this.clearQueue();
    });

    // Listen for play, pause, time updates and duration
    const syncPlayPause = () => {
      const isPlaying = !this.audio.paused;
      this.isPlaying.set(isPlaying);
      this.updatePlaybackMetadata(isPlaying);
    };
    const syncTime = () => {
      const duration = this.audio.duration;
      const playbackRate = this.audio.playbackRate;
      const currentTime = this.audio.currentTime;
      if (isFinite(currentTime)) {
        this.currentTime.set(currentTime);
        this.updatePositionMetadata(duration, playbackRate, currentTime);
      }
    };
    const syncDuration = () => {
      const duration = this.audio.duration;
      const playbackRate = this.audio.playbackRate;
      const currentTime = this.audio.currentTime;
      if (isFinite(duration)) {
        this.duration.set(duration);
        this.updatePositionMetadata(duration, playbackRate, currentTime);
      }
    };

    const syncBuffered = () => {
      const buffered = [];
      for (let i = 0; i < this.audio.buffered.length; i++) {
        buffered.push({
          start: this.audio.buffered.start(i),
          end: this.audio.buffered.end(i)
        });
      }
      this.buffered.set(buffered);
    };

    this.audio.addEventListener('play', syncPlayPause);
    this.audio.addEventListener('pause', syncPlayPause);

    this.audio.addEventListener('progress', syncBuffered);

    this.audio.addEventListener('timeupdate', syncTime);
    this.audio.addEventListener('seeking', () => { syncTime(); syncBuffered(); });
    this.audio.addEventListener('seeked', () => { syncTime(); syncBuffered(); });

    this.audio.addEventListener('loadedmetadata', () => { syncDuration(); syncBuffered(); });
    this.audio.addEventListener('durationchange', () => { syncDuration(); syncBuffered(); });

    // Go to next when audio ends
    this.audio.addEventListener('ended', () => this.next());

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
      this.hasRetriedAfterError.set(false);
    });

    // error
    this.audio.addEventListener('error', async (event) => {
      // Always retry once, if logged also refresh token
      if (this.hasRetriedAfterError() || !this.authService.isLoggedIn()) {
        this.isLoading.set(false);
        this.isPlaying.set(false);
        this.isError.set(true);
        this._errorEvent$.next(event);
        this.hasRetriedAfterError.set(false); // reset for next time
        return;
      }

      // First failure, try again after refreshing token
      this.hasRetriedAfterError.set(true);

      try {
        await firstValueFrom(this.authService.refreshTokens());
      } catch (error) { }
      this.loadAudio(this.currentTrack()!, this.currentTime(), this.isPlaying());
    });

    // set media session for smartphones
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('stop', () => this.stop());
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

  // AUDIO
  private loadAudio(track: AudioTrack, time: number = 0, play: boolean = false) {
    let url = track?.audioSrc;
    if (!url) return;

    // Check if offline
    const offlineUrl = this.offlineUrlPipe.transform(url)!;
    if (offlineUrl !== url) {
      this.audio.src = offlineUrl;
      this.audio.load();
      this.audio.currentTime = time;
      if (play) this.audio.play();
      this.loadMetadata(track);
      return;
    }

    // Check if token is valid
    const token = this.authService.getAccessToken();
    if (token) {
      const authUrl = this.authUrlPipe.transform(url)!;
      this.audio.src = authUrl;
      this.audio.load();
      this.audio.currentTime = time;
      if (play) this.audio.play();
      this.loadMetadata(track);
      return;
    }

    this.audio.src = url;
    this.audio.load();
    this.audio.currentTime = time;
    if (play) this.audio.play();
    this.loadMetadata(track);
  }

  private seekAudio(time: number) {
    this.audio.currentTime = time;
  }

  private playAudio() {
    this.audio.play();
  }

  private pauseAudio() {
    this.audio.pause();
  }

  private clearAudio() {
    this.audio.pause();
    this.audio.removeAttribute('src'); // remove src attribute entirely
    this.audio.load(); // reset the element
    this.audio.currentTime = 0; // sync time to 0 to prevent UI glitch

    this.clearMetadata();
  }

  // METADATA
  private loadMetadata(track: AudioTrack) {
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
  private updatePositionMetadata(duration: number, playbackRate: number, currentTime: number) {
    if (
      'mediaSession' in navigator &&
      'setPositionState' in navigator.mediaSession &&
      this.audio.readyState >= 2 // HAVE_CURRENT_DATA or higher
    ) {
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: playbackRate,
        position: currentTime
      });
    }
  }
  private updatePlaybackMetadata(isPlaying: boolean) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }
  private clearMetadata() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    }
  }

  // PUBLIC METHODS
  clear() {
    this.clearAudio();
    this.currentTime.set(0);
    this.duration.set(0);
    this.buffered.set([]);
  }

  loadId(id: number) {
    this.clear();

    this.currentId.set(id);
    const track = this.currentTrack();
    if (track) {
      this.loadAudio(track);
    }
  }

  togglePlay() {
    if (this.isPlaying()) this.pause();
    else this.play();
  }
  play() {
    if (this.isError()) this.loadAudio(this.currentTrack()!, this.currentTime(), true);
    else this.playAudio();
  }
  playId(id: number) {
    // avoid glitch when changing track
    this.currentTime.set(0);
    this.duration.set(0);
    this.buffered.set([]);

    this.currentId.set(id);
    const track = this.currentTrack();
    if (track) {
      this.loadAudio(track, 0, true);
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

    // track to play
    const playTrack = newQueue.find(t => t.audioSrc === track?.audioSrc)!;

    // set signals
    this.idCounter.set(idCounter);
    this.queue.set(newQueue);
    this.playId(playTrack.id!);
  }

  seek(time: number) {
    this.currentTime.set(time); // set time to avoid ui glitch
    if (this.isError()) this.loadAudio(this.currentTrack()!, time, true);
    else this.seekAudio(time);
  }

  pause() {
    this.pauseAudio();
  }

  stop() {
    this.pause();
    this.clear();
    this.currentId.set(null);
  }

  next() {
    if (this.nextTrack() != null) {
      this.playId(this.nextTrack()!.id!);
    } else {
      this.seek(this.duration());
    }
  }

  previous() {
    if (this.currentTime() > 5) {
      this.seek(0);
    } else if (this.previousTrack() != null) {
      this.playId(this.previousTrack()!.id!);
    } else {
      this.seek(0);
    }
  }

  // QUEUE
  restartQueue() {
    const q = this.queue();
    if (q.length > 0) {
      this.playId(q[0].id!);
    }
  }

  addToQueue(track: AudioTrack) {
    const id = this.idCounter() + 1;
    const newTrack: AudioTrack = structuredClone({ ...track, id: id });

    this.idCounter.set(id);
    this.queue.update(q => [...q, newTrack]);

    // set current if doesn t exists
    if (this.currentId() == null) {
      this.loadId(newTrack.id!);
    }
  }

  removeFromQueue(id: number) {
    this.queue.update(q => q.filter(t => t.id !== id));

    if (this.currentId() === id) {
      // auto-play next if available, otherwise stop
      const q = this.queue();
      if (q.length > 0) {
        this.loadId(q[0].id!);
      } else {
        this.stop();
      }
    }
  }

  clearQueue() {
    this.queue.set([]);
    this.stop();
  }

  // flags
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
