import { computed, inject, Injectable, signal } from '@angular/core';
import { AudioTrack } from '../models/audio-track.model';
import { DialogService } from './dialog.service';
import { ToasterService } from './toaster.service';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private audio = new Audio();
  private audioError = signal<boolean>(false);

  // Signals for state
  queue = signal<AudioTrack[]>([]);
  currentId = signal<number>(null!);
  idCounter = signal<number>(0);
  isPlaying = signal(false);

  // Signals for Time/Seek
  currentTime = signal(0);
  duration = signal(0);

  // Computed signal: current track
  currentTrack = computed(() => {
    return this.queue().find(t => t.id === this.currentId()) ?? null;
  });

  constructor() {
    // Go to next when audio ends
    this.audio.addEventListener('ended', () => this.next());

    // Listen for time updates and duration
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime.set(this.audio.currentTime);
    });
    this.audio.addEventListener('loadedmetadata', () => {
      this.duration.set(this.audio.duration);
    });

    // listen to errors
    this.audio.addEventListener('error', (event) => {
      this.audioError.set(true);
      this.toasterService.show("Audio error", { type: 'error' });
      console.error('Audio error', this.audio, this.audio.error);
    });

    // set error false when it loads
    this.audio.addEventListener('canplay', () => {
      this.audioError.set(false);
    });
  }

  private loadAudio(track: AudioTrack) {
    this.audio.src = track?.audioSrc;
    this.loadAudioMetadata(track);
  }
  private loadAudioMetadata(track: AudioTrack) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track?.title,
        artist: track?.subtitle,
        artwork: [
          { src: track?.coverImageSrc!, sizes: '512x512', type: 'image/png' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
    }
  }

  loadId(id: number) {
    this.currentId.set(id);
    const track = this.currentTrack();
    if (track) {
      this.loadAudio(track);
      this.audio.pause();
      this.isPlaying.set(false);
    }
  }

  togglePlay() {
    if (this.isPlaying()) this.pause();
    else this.play();
  }
  play() {
    this.audio.play();
    this.isPlaying.set(true);
  }
  playId(id: number) {
    this.currentId.set(id);
    const track = this.currentTrack();
    if (track) {
      this.loadAudio(track);
      this.audio.play();
      this.isPlaying.set(true);
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
    const playTrack = newQueue.find(t => t.audioSrc === track.audioSrc)!;

    // set signals
    this.idCounter.set(idCounter);
    this.queue.set(newQueue);
    this.playId(playTrack.id);
  }


  pause() {
    this.audio.pause();
    this.isPlaying.set(false);
  }

  stop() {
    this.audio.pause();
    this.loadAudio(null!);
    this.currentId.set(null!);
    this.isPlaying.set(false);
  }

  next() {
    const q = this.queue();
    const currentIndex = q.findIndex(t => t.id === this.currentId());
    if (currentIndex >= 0 && currentIndex + 1 < q.length) {
      this.playId(q[currentIndex + 1].id);
    }
  }

  previous() {
    const q = this.queue();
    const currentIndex = q.findIndex(t => t.id === this.currentId());
    if (currentIndex > 0) {
      this.playId(q[currentIndex - 1].id);
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

  seek(time: number) {
    // Only seek if the audio is loaded
    if (this.audio.readyState > 0) {
      this.audio.currentTime = time;
    }
  }

  isCurrentAudioSrc(audioSrc: string): boolean {
    return this.currentTrack()?.audioSrc === audioSrc;
  }
  isCurrentPlayingAudioSrc(audioSrc: string): boolean {
    return this.isCurrentAudioSrc(audioSrc) && this.isPlaying();
  }
}
