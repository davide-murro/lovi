import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AudioTrack } from '../models/audio-track.model';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';
import { FetchClient } from '../interceptors/fetch-client/fetch-client.service';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  private fetchClient = inject(FetchClient);
  private authService = inject(AuthService);

  private audio = new Audio();

  // Stream state
  // Each load gets a unique "session" id. The streaming loop checks it and
  // self-terminates if a newer session has started, eliminating all races.
  private _sessionId = 0;
  private _activeAbortController?: AbortController;

  // flag to indicate if play/pause was requested and will start after loading
  private _timeRequested = signal(0);
  private _playRequested = signal(false);
  private _pauseRequested = signal(false);
  private _isRequesting = computed(() => this._timeRequested() > 0 || this._playRequested() || this._pauseRequested());

  // Signals for state
  queue = signal<AudioTrack[]>([]);
  currentId = signal<number | null>(null);
  idCounter = signal<number>(0);

  // Signals for Time/Seek
  currentTime = signal(0);
  duration = signal(0);
  fileSize = signal(0);

  isElaborating = signal<boolean>(false);
  isRealPlaying = signal<boolean>(false);

  isLoading = computed(() => this.isElaborating() || this._isRequesting());
  isPlaying = computed(() => this.isRealPlaying() || this._playRequested());
  isError = signal<boolean>(false);

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
    // TODO: when islogged load queue from saved data in DB
    effect(() => {
      if (!this.authService.isLoggedIn()) this.removeAllQueue();
    });

    // Go to next when audio ends
    this.audio.addEventListener('ended', () => this.next());

    this.audio.addEventListener('play', () => {
      this.isRealPlaying.set(true);
      this.updatePlaybackMetadata();
      this._playRequested.set(false);
    });
    this.audio.addEventListener('pause', () => {
      this.isRealPlaying.set(false);
      //this.currentTime.set(this.audio.currentTime); // Sync time on pause to ensure the UI is 100% accurate
      this.updatePlaybackMetadata();
      this._pauseRequested.set(false);
    });

    // Listen for time updates and duration
    const syncTime = () => {
      const currentTime = this._timeRequested() > 0 ? this._timeRequested() : this.audio.currentTime;
      if (isFinite(currentTime)) {
        this.currentTime.set(currentTime);
        this.updatePositionMetadata();
      }
    };

    const syncDuration = () => {
      if (isFinite(this.audio.duration)) {
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

      if (this._playRequested()) {
        this.audio.play();
      }
      if (this._pauseRequested()) {
        this.audio.pause();
      }
    });

    // error
    this.audio.addEventListener('error', (event) => {
      this.isElaborating.set(false);
      this.isError.set(true);
      this.isRealPlaying.set(false);

      this._errorEvent$.next(event);

      this._playRequested.set(false);
      this._pauseRequested.set(false);
      this._timeRequested.set(0);
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

  private async loadAudio(track: AudioTrack, startTime: number = 0, playAfterLoad: boolean = false) {
    this.audio.pause();
    this._pauseRequested.set(false);
    this._playRequested.set(playAfterLoad)
    this._timeRequested.set(startTime);

    // Cancel any in-flight stream immediately
    this._activeAbortController?.abort();
    const abort = new AbortController();
    this._activeAbortController = abort;

    // Stamp this session — the pump loop will exit if the id changes
    const sessionId = ++this._sessionId;
    const isAlive = () => !abort.signal.aborted && this._sessionId === sessionId;

    try {
      const url = track?.audioSrc;
      if (!url) return;

      // Calculate byte offset with the previous duration and file size
      let byteOffset: number = 0;
      if (startTime > 0) {
        const ratio = startTime / this.duration();
        byteOffset = Math.floor(ratio * this.fileSize());
      }
      const response = await this.fetchClient.request(url, {
        signal: abort.signal,
        headers: {
          Range: `bytes=${byteOffset}-`
        }
      });

      if (!isAlive()) return;

      // check ok
      if (!response.ok || !response.body) {
        throw new Error('Error loading audio');
      }

      // get headers 
      const contentTypeHeader = response.headers.get('Content-Type') || 'audio/mpeg';
      const lengthHeader = response.headers.get('Content-Length');
      const durationHeader = response.headers.get('X-Duration');
      const mimeType = MediaSource.isTypeSupported(contentTypeHeader)
        ? contentTypeHeader
        : 'audio/mpeg';

      const fileSize = lengthHeader ? parseInt(lengthHeader, 10) : 0;
      if (startTime === 0) this.fileSize.set(fileSize);

      const duration = durationHeader ? parseFloat(durationHeader) : 0;
      if (duration > 0) this.duration.set(duration);

      // create media source
      const mediaSource = new MediaSource();

      const objectUrl = URL.createObjectURL(mediaSource);
      this.audio.src = objectUrl;
      this.loadMetadata(track);

      // Clean up the blob URL once the source is opened (or aborted)
      abort.signal.addEventListener('abort', () => URL.revokeObjectURL(objectUrl), { once: true });

      await new Promise<void>((resolve, reject) => {
        mediaSource.addEventListener('sourceopen', async () => {
          try {
            if (!isAlive()) { resolve(); return; }

            if (duration > 0) {
              mediaSource.duration = duration;
            }

            let sourceBuffer: SourceBuffer;
            try {
              sourceBuffer = mediaSource.addSourceBuffer(mimeType);
            } catch (e) {
              reject(e); return;
            }

            // Offset timestamps so chunks align with real playback time when seeking
            if (startTime > 0) {
              sourceBuffer.timestampOffset = startTime;
              // Set playhead AFTER src is assigned so it sticks
              this.audio.currentTime = startTime;
              this._timeRequested.set(0);
            }

            const reader = response.body!.getReader();

            // Cancel reader when this session is aborted
            abort.signal.addEventListener('abort', () => reader.cancel(), { once: true });

            const waitForUpdateEnd = () =>
              new Promise<void>((resolve) => {
                if (!sourceBuffer.updating) return resolve();
                sourceBuffer.addEventListener('updateend', () => resolve(), { once: true });
              });

            const sleep = (ms: number) =>
              new Promise<void>((resolve) => setTimeout(resolve, ms));

            while (isAlive()) {
              if (mediaSource.readyState !== 'open') break;

              // Throttle: max 60s ahead
              if (sourceBuffer.buffered.length > 0) {
                const bufferedEnd = sourceBuffer.buffered.end(sourceBuffer.buffered.length - 1);
                const currentTime = this.audio.currentTime;

                if (bufferedEnd - currentTime > 60) {
                  await sleep(500);
                  continue;
                }
              }

              // Read chunk
              let result: ReadableStreamReadResult<Uint8Array>;
              try {
                result = await reader.read();
              } catch {
                break; // reader cancelled or network error
              }

              if (!isAlive()) break;

              if (result.done) {
                await waitForUpdateEnd();
                if (mediaSource.readyState === 'open') {
                  try { mediaSource.endOfStream(); } catch { }
                }
                break;
              }

              // Append safely
              try {
                const chunk = new Uint8Array(result.value);
                sourceBuffer.appendBuffer(chunk.buffer);
              } catch (e: any) {
                if (e.name === 'QuotaExceededError') {
                  // simple backoff
                  await sleep(500);
                  continue;
                }
                break;
              }

              try {
                await waitForUpdateEnd();
              } catch {
                break; // Aborted mid-append
              }

              // Garbage collection (light, safe)
              if (sourceBuffer.buffered.length > 0) {
                const start = sourceBuffer.buffered.start(0);
                const currentTime = this.audio.currentTime;

                if (currentTime - start > 300) {
                  try {
                    sourceBuffer.remove(start, currentTime - 120);
                    await waitForUpdateEnd();
                  } catch { }
                }
              }
            }
            resolve();
          } catch (err) {
            reject(err);
          }
        }, { once: true });
        mediaSource.addEventListener('sourceended', () => resolve(), { once: true });
        mediaSource.addEventListener('sourceerror', () => reject(new Error('MediaSource error')), { once: true });
      });

    } catch (err: any) {
      if (abort.signal.aborted) return; // expected — not an error

      this.audio.currentTime = startTime;
      this.audio.pause();

      this.isElaborating.set(false);
      this.isError.set(true);
      this.isRealPlaying.set(false);

      this._errorEvent$.next(err);

      this._playRequested.set(false);
      this._pauseRequested.set(false);
      this._timeRequested.set(0);
    }
  }

  private async seekAudio(time: number, playAfterSeek: boolean) {
    if (this.isTimeBuffered(time)) {
      // Already in buffer — just move playhead, pump continues naturally
      this.audio.currentTime = time;
      if (playAfterSeek) this.audio.play();
      return;
    }

    // loadAudio handles aborting the previous session internally
    await this.loadAudio(this.currentTrack()!, time, playAfterSeek);
  }
  private async pauseAudio() {
    if (this.audio.readyState >= 2) {
      if (!this.audio.paused) {
        this._pauseRequested.set(true);
        this._playRequested.set(false);
      }
      this.audio.pause();
    }
  }
  private async playAudio() {
    if (this.audio.readyState >= 2) {
      if (this.audio.paused) {
        this._playRequested.set(true);
        this._pauseRequested.set(false);
      }
      this.audio.play();
    } else {
      await this.loadAudio(this.currentTrack()!, this.audio.currentTime, true);
    }
  }
  private clearAudio() {
    // Abort the stream first, then clear the element
    this._activeAbortController?.abort();
    this.audio.pause();
    this.audio.removeAttribute('src'); // remove src attribute entirely
    this.audio.load(); // reset the element

    this._playRequested.set(false);
    this._pauseRequested.set(false);
    this._timeRequested.set(0);

    this.clearMetadata();
  }

  private isTimeBuffered(time: number): boolean {
    for (let i = 0; i < this.audio.buffered.length; i++) {
      if (time >= this.audio.buffered.start(i) && time <= this.audio.buffered.end(i)) {
        return true;
      }
    }
    return false;
  }

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

  loadId(id: number) {
    this.currentId.set(id);
    const track = this.currentTrack();
    if (track) {
      this.clear();
      this.loadAudio(track);
      this.pause();
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
  play() {
    this.playAudio();
  }
  playId(id: number) {
    this.currentId.set(id);
    const track = this.currentTrack();
    if (track) {
      this.clear();
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
    this.playId(playTrack.id!);
  }

  restartQueue() {
    const q = this.queue();
    if (q.length > 0) {
      this.playId(q[0].id!);
      this.seek(0);
    }
  }


  pause() {
    this.pauseAudio();
    this.isRealPlaying.set(false); // sync immediately to prevent UI problems
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
      this.seek(this.duration(), false);
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

  removeAllQueue() {
    this.queue.set([]);
    this.stop();
  }

  seek(time: number, playAfterSeek: boolean = this.isPlaying()) {
    this.seekAudio(time, playAfterSeek);
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
