import { Component, computed, inject, input } from '@angular/core';
import { from } from 'rxjs';
import { AudioPlayerService } from '../../../../core/services/audio-player.service';
import { AudioTrack } from '../../../../core/models/audio-track.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faBookBookmark, faBookOpen, faCircleNotch, faFileArrowDown, faForward, faList, faPause, faPlay, faFile } from '@fortawesome/free-solid-svg-icons';
import { ToasterService } from '../../../../core/services/toaster.service';
import { OfflineService } from '../../../../core/services/offline.service';
import { PodcastEpisodeDto } from '../../../../core/models/dtos/podcast-episode-dto.model';
import { LibrariesService } from '../../../../core/services/libraries.service';
import { ManageLibraryDto } from '../../../../core/models/dtos/manage-library-dto.model';
import { AuthDirective } from '../../../../core/directives/auth.directive';
import { AuthService } from '../../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { OfflineUrlPipe } from '../../../../core/pipes/offline-url.pipe';

@Component({
  selector: 'app-podcast-episode',
  imports: [FontAwesomeModule, RouterLink, AuthDirective, OfflineUrlPipe],
  templateUrl: './podcast-episode.html',
  styleUrl: './podcast-episode.scss'
})
export class PodcastEpisode {
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private audioPlayerService = inject(AudioPlayerService);
  private authService = inject(AuthService);
  private librariesService?: LibrariesService;
  private offlineService?: OfflineService;

  faPlay = faPlay;
  faPause = faPause;
  faList = faList;
  faBackward = faBackward;
  faForward = faForward;
  faBookOpen = faBookOpen;
  faBookBookmark = faBookBookmark;
  faFileArrowDown = faFileArrowDown;
  faFile = faFile;
  faCircleNotch = faCircleNotch;

  // episode
  podcastEpisode = input.required<PodcastEpisodeDto>();

  currentIndex = computed(() => this.podcastEpisode().podcast!.episodes!.findIndex(pe => pe.number == this.podcastEpisode().number));
  episodePrev = computed(() => this.podcastEpisode().podcast!.episodes![this.currentIndex() - 1] ?? null);
  episodeNext = computed(() => this.podcastEpisode().podcast!.episodes![this.currentIndex() + 1] ?? null);

  isOffline = computed(() => this.offlineService?.isPodcastEpisodeDownloaded(this.podcastEpisode().id!) ?? false);
  isOfflineLoading = computed(() => (this.offlineService?.isPodcastEpisodeDownloading(this.podcastEpisode().id!) || this.offlineService?.isPodcastEpisodeDeleting(this.podcastEpisode().id!)) ?? false);
  isInMyLibrary = computed(() => this.librariesService?.myLibrary()?.some(l => l.podcast?.id === this.podcastEpisode().podcast!.id && l.podcastEpisode?.id === this.podcastEpisode().id));
  isMyLibraryLoading = computed(() => this.librariesService?.isLoading());
  isCurrentTrack = computed(() => this.audioPlayerService.isCurrentAudioSrc(this.podcastEpisode().audioUrl!));
  isCurrentTrackPlaying = computed(() => this.audioPlayerService.isCurrentPlayingAudioSrc(this.podcastEpisode().audioUrl!));
  isCurrentTrackLoading = computed(() => this.audioPlayerService.isCurrentLoadingAudioSrc(this.podcastEpisode().audioUrl!));

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.librariesService = inject(LibrariesService);
      this.offlineService = inject(OfflineService);
    }
  }

  // episode
  prevEpisode() {
    this.router.navigate(['/podcasts', this.podcastEpisode().podcast!.id, 'episodes', this.episodePrev()!.id]);
  }
  nextEpisode() {
    this.router.navigate(['/podcasts', this.podcastEpisode().podcast!.id, 'episodes', this.episodeNext()!.id]);
  }

  // audio player
  togglePlay() {
    if (this.isCurrentTrackPlaying()) this.pause();
    else if (this.isCurrentTrack()) this.play();
    else this.playAll();
  }
  play() {
    this.audioPlayerService.play();
  }
  pause() {
    this.audioPlayerService.pause();
  }
  playAll() {
    const number = this.podcastEpisode().number;
    const episodeTrack: AudioTrack = {
      title: this.podcastEpisode().name,
      subtitle: $localize`Episode ${number}`,
      artists: this.podcastEpisode().voicers?.map(v => v.nickname),
      audioSrc: this.podcastEpisode().audioUrl!,
      coverImageSrc: this.podcastEpisode().coverImagePreviewUrl,
      referenceLink: `/podcasts/${this.podcastEpisode().podcast!.id}/episodes/${this.podcastEpisode().id}`
    };
    const episodeQueue = this.podcastEpisode().podcast!.episodes!
      .map(pe => {
        const number = pe.number;
        const track: AudioTrack = {
          title: pe.name,
          subtitle: $localize`Episode ${number}`,
          artists: pe.voicers?.map(v => v.nickname),
          audioSrc: pe.audioUrl!,
          coverImageSrc: pe.coverImagePreviewUrl,
          referenceLink: `/podcasts/${this.podcastEpisode().podcast!.id}/episodes/${pe.id}`
        }
        return track
      });

    this.audioPlayerService.playTrack(episodeTrack, episodeQueue);
    this.toasterService.show($localize`"${this.podcastEpisode().podcast!.name}" episodes added to queue`);
  }
  addToQueue() {
    const episodeTrack: AudioTrack = {
      title: this.podcastEpisode().name,
      subtitle: $localize`Episode ${this.podcastEpisode().number}`,
      artists: this.podcastEpisode().voicers?.map(v => v.nickname),
      audioSrc: this.podcastEpisode().audioUrl!,
      coverImageSrc: this.podcastEpisode().coverImagePreviewUrl,
      referenceLink: `/podcasts/${this.podcastEpisode().podcast!.id}/episodes/${this.podcastEpisode().id}`
    }
    this.audioPlayerService.addToQueue(episodeTrack);
    this.toasterService.show($localize`"${this.podcastEpisode().name}" added to queue`);
  }

  // libraries
  toggleMyLibrary() {
    if (this.isInMyLibrary()) this.removeFromMyLibrary();
    else this.addToMyLibrary();
  }
  addToMyLibrary() {
    const episodeLibrary: ManageLibraryDto = {
      podcastId: this.podcastEpisode().podcast!.id,
      podcastEpisodeId: this.podcastEpisode().id
    };

    this.librariesService!.createMe(episodeLibrary).subscribe({
      next: () => {
        this.toasterService.show($localize`"${this.podcastEpisode().name}" added to My Library`);
      },
      error: (err) => {
        console.error('librariesService.createMe', episodeLibrary, err);
        this.toasterService.show($localize`"${this.podcastEpisode().name}" adding to My Library failed`, { type: 'error' });
      }
    });
  }
  removeFromMyLibrary() {
    const id: number = this.librariesService!.myLibrary()!
      .find(ml => ml.podcast?.id == this.podcastEpisode().podcast!.id && ml.podcastEpisode?.id == this.podcastEpisode().id)!.id!;

    this.librariesService!.deleteMe(id).subscribe({
      next: () => {
        this.toasterService.show($localize`"${this.podcastEpisode().name}" removed from My Library`);
      },
      error: (err) => {
        console.error('librariesService.deleteMe', id, err);
        this.toasterService.show($localize`"${this.podcastEpisode().name}" removing from My Library failed`, { type: 'error' });
      }
    });
  }

  // offline
  toggleOffline() {
    if (this.isOffline()) this.removeOffline();
    else this.addOffline();
  }
  addOffline() {
    this.toasterService.show($localize`"${this.podcastEpisode().name}" downloading...`);
    from(this.offlineService!.downloadPodcastEpisode(this.podcastEpisode())).subscribe({
      next: () => {
        this.toasterService.show($localize`"${this.podcastEpisode().name}" added to offline`, { type: 'success' });
      },
      error: (err) => {
        console.error('offlineService.downloadPodcastEpisode', this.podcastEpisode(), err);
        this.toasterService.show($localize`"${this.podcastEpisode().name}" adding to offline failed`, { type: 'error' });
      }
    });
  }
  removeOffline() {
    from(this.offlineService!.removePodcastEpisode(this.podcastEpisode().id!)).subscribe({
      next: () => {
        this.toasterService.show($localize`"${this.podcastEpisode().name}" removed from offline`);
      },
      error: (err) => {
        console.error('offlineService.removePodcastEpisode', this.podcastEpisode().id!, err);
        this.toasterService.show($localize`"${this.podcastEpisode().name}" removing from offline failed`, { type: 'error' });
      }
    });
  }
}
