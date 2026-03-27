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

  private isChecking = signal(false);

  // Signals for state
  queue = signal<AudioTrack[]>([]);
  currentId = signal<number | null>(null);
  idCounter = signal<number>(0);

  // Signals for Time/Seek
  currentTime = signal(0);
  duration = signal(0);
  fileSize = signal(0);

  private isElaborating = signal<boolean>(false);
  isPlaying = signal<boolean>(false);
  isError = signal<boolean>(false);

  private _errorEvent$ = new Subject<any>();
  public readonly errorEvent$ = this._errorEvent$.asObservable();

  isLoading = computed(() => this.isChecking() || this.isElaborating());

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
      if (!this.authService.isLoggedIn()) this.removeAllQueue();
    });

    // Go to next when audio ends
    this.audio.addEventListener('ended', () => this.next());

    this.audio.addEventListener('play', () => {
      this.isPlaying.set(true);
      this.updatePlaybackMetadata();
    });
    this.audio.addEventListener('pause', () => {
      this.isPlaying.set(false);
      //this.currentTime.set(this.audio.currentTime); // Sync time on pause to ensure the UI is 100% accurate
      this.updatePlaybackMetadata();
    });

    // Listen for time updates and duration
    const syncTime = () => {
      if (isFinite(this.audio.currentTime) && !this.isChecking()) {
        this.currentTime.set(this.audio.currentTime);
        this.updatePositionMetadata();
      }
    };

    const syncDuration = () => {
      if (isFinite(this.audio.duration) && !this.isChecking()) {
        this.duration.set(this.audio.duration);
        this.updatePositionMetadata();
        this.updatePlaybackMetadata();
      }
    };

    this.audio.addEventListener('timeupdate', syncTime);
    this.audio.addEventListener('seeking', syncTime);
    this.audio.addEventListener('seeked', syncTime);

    this.audio.addEventListener('loadedmetadata', syncDuration);
    this.audio.addEventListener('durationchange', syncDuration);

    // start loading
    this.audio.addEventListener('loadstart', () => {
      this.isElaborating.set(true);
    });

    // buffering
    this.audio.addEventListener('waiting', () => {
      this.isElaborating.set(true);
    });

    // playable again
    this.audio.addEventListener('canplay', () => {
      this.isElaborating.set(false);
      this.isError.set(false);
    });

    // error
    this.audio.addEventListener('error', async (event) => {
      // Wait a moment in case the error was transient or token just refreshed
      this.isElaborating.set(false);
      this.isPlaying.set(false);
      this.isError.set(true);
      this._errorEvent$.next(event);
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

  private async checkToken() {
    try {
      this.isChecking.set(true);
      await firstValueFrom(this.authService.ensureTokens());
      this.isChecking.set(false);
    } catch (error) {
      this.isChecking.set(false);
    }
  }

  // AUDIO
  private async loadAudio(track: AudioTrack) {
    let url = track?.audioSrc;
    if (!url) return;

    // Check if offline
    url = this.offlineUrlPipe.transform(url) ?? url;
    if (url !== track?.audioSrc) {
      this.audio.src = url;
      this.audio.load();
      this.loadMetadata(track);
      return;
    }

    // Check if token is valid
    this.audio.pause();
    await this.checkToken();
    url = this.authUrlPipe.transform(url) ?? url;

    this.audio.src = url;
    this.audio.load();
    this.loadMetadata(track);
  }

  private async seekAudio(time: number) {
    // Check if the time is already buffered in memory to skip network checks
    let isBuffered = false;
    for (let i = 0; i < this.audio.buffered.length; i++) {
      // Add a small 1-second margin because the end of the buffer might trigger a load
      if (time >= this.audio.buffered.start(i) && time <= this.audio.buffered.end(i) - 1) {
        isBuffered = true;
        break;
      }
    }
    if (isBuffered) {
      // We are offline, or the range is fully buffered. Direct seek.
      this.audio.currentTime = time;
      return;
    }

    // Check if offline
    let url = this.currentTrack()?.audioSrc!;
    if (!url) return;
    const offlineUrl = this.offlineUrlPipe.transform(url)!;
    if (offlineUrl !== url) {
      if (this.audio.src !== offlineUrl) {
        this.audio.src = offlineUrl;
        this.audio.load();
      }
      this.audio.currentTime = time;
      return;
    }

    // Ensure token before browser sends a Range request.
    this.audio.pause();
    const oldToken = this.authService.getAccessToken();
    await this.checkToken();
    const newToken = this.authService.getAccessToken();
    if (oldToken !== newToken) {
      let url = this.currentTrack()?.audioSrc;
      if (url) {
        url = this.authUrlPipe.transform(url) ?? url;
        this.audio.src = url;
        this.audio.load();
      }
    }

    this.audio.currentTime = time;
  }

  private pauseAudio() {
    this.audio.pause();
  }

  private playAudio() {
    this.audio.play();
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
  private updatePositionMetadata() {
    if (
      'mediaSession' in navigator &&
      'setPositionState' in navigator.mediaSession &&
      this.audio.readyState >= 2 // HAVE_CURRENT_DATA or higher
    ) {
      navigator.mediaSession.setPositionState({
        duration: this.audio.duration,
        playbackRate: this.audio.playbackRate,
        position: this.audio.currentTime
      });
    }
  }
  private updatePlaybackMetadata() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = this.audio.paused ? 'paused' : 'playing';
    }
  }
  private clearMetadata() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    }
  }

  // PUBLIC METHODS
  async loadId(id: number) {
    this.currentId.set(id);
    const track = this.currentTrack();
    if (track) {
      this.clear();
      await this.loadAudio(track);
    }
  }

  clear() {
    this.clearAudio();
    this.currentTime.set(0);
    this.duration.set(0);
    this.fileSize.set(0);
  }

  togglePlay() {
    if (this.isPlaying()) this.pause();
    else this.play();
  }
  async play() {
    if (this.isError()) await this.seek(this.currentTime());
    this.playAudio();
  }
  async playId(id: number) {
    this.currentId.set(id);
    const track = this.currentTrack();
    if (track) {
      this.clear();
      await this.loadAudio(track);
      this.playAudio();
    }
  }
  async playTrack(track: AudioTrack, newQueue: AudioTrack[] = []) {
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
    await this.playId(playTrack.id!);
  }

  async seek(time: number) {
    this.currentTime.set(time); // Sync to avoid UI glitch
    if (this.isError()) await this.loadAudio(this.currentTrack()!);

    await this.seekAudio(time);
    this.playAudio();
  }

  pause() {
    this.isPlaying.set(false); // sync immediately to prevent UI problems
    this.pauseAudio();
  }

  stop() {
    this.pause();
    this.clear();
    this.currentId.set(null);
  }

  async next() {
    if (this.nextTrack() != null) {
      await this.playId(this.nextTrack()!.id!);
    } else {
      await this.seek(this.duration());
    }
  }

  async previous() {
    if (this.currentTime() > 5) {
      await this.seek(0);
    } else if (this.previousTrack() != null) {
      await this.playId(this.previousTrack()!.id!);
    } else {
      await this.seek(0);
    }
  }

  async restartQueue() {
    const q = this.queue();
    if (q.length > 0) {
      await this.playId(q[0].id!);
    }
  }

  async addToQueue(track: AudioTrack) {
    const id = this.idCounter() + 1;
    const newTrack: AudioTrack = structuredClone({ ...track, id: id });

    this.idCounter.set(id);
    this.queue.update(q => [...q, newTrack]);

    // set current if doesn t exists
    if (this.currentId() == null) {
      await this.loadId(newTrack.id!);
    }
  }

  async removeFromQueue(id: number) {
    this.queue.update(q => q.filter(t => t.id !== id));

    if (this.currentId() === id) {
      // auto-play next if available, otherwise stop
      const q = this.queue();
      if (q.length > 0) {
        await this.loadId(q[0].id!);
      } else {
        this.stop();
      }
    }
  }

  removeAllQueue() {
    this.queue.set([]);
    this.stop();
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
