import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { from } from 'rxjs';
import { AudioPlayerService } from '../../../../core/services/audio-player.service';
import { AudioTrack } from '../../../../core/models/audio-track.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faBookBookmark, faBookOpen, faCircleNotch, faFileArrowDown, faForward, faList, faPause, faPlay, faDownload } from '@fortawesome/free-solid-svg-icons';
import { ToasterService } from '../../../../core/services/toaster.service';
import { OfflineService } from '../../../../core/services/offline.service';
import { PodcastDto } from '../../../../core/models/dtos/podcast-dto.model';
import { PodcastEpisodeDto } from '../../../../core/models/dtos/podcast-episode-dto.model';
import { LibrariesService } from '../../../../core/services/libraries.service';
import { ManageLibraryDto } from '../../../../core/models/dtos/manage-library-dto.model';
import { AuthDirective } from '../../../../core/directives/auth.directive';
import { RouterLink } from '@angular/router';
import { SecureMediaDirective } from '../../../../core/directives/secure-media.directive';
import { DialogService } from '../../../../core/services/dialog.service';

@Component({
  selector: 'app-podcast-episode-details',
  imports: [FontAwesomeModule, RouterLink, AuthDirective, SecureMediaDirective],
  templateUrl: './podcast-episode-details.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './podcast-episode-details.scss'
})
export class PodcastEpisodeDetails {
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private audioPlayerService = inject(AudioPlayerService);
  private librariesService = inject(LibrariesService);
  private offlineService = inject(OfflineService);

  myLibraryTitle = computed(() =>
    this.isInMyLibrary()
      ? $localize`Remove from My Library`
      : $localize`Add to My Library`
  );

  offlineTitle = computed(() =>
    this.isOffline()
      ? $localize`Remove from Offline`
      : $localize`Download Offline`
  );

  playPauseTitle = computed(() =>
    this.isCurrentTrackPlaying()
      ? $localize`Pause`
      : $localize`Play`
  );

  faPlay = faPlay;
  faPause = faPause;
  faList = faList;
  faBackward = faBackward;
  faForward = faForward;
  faBookOpen = faBookOpen;
  faBookBookmark = faBookBookmark;
  faDownload = faDownload;
  faFileArrowDown = faFileArrowDown;
  faCircleNotch = faCircleNotch;

  // episode
  podcastEpisode = input.required<PodcastEpisodeDto>();
  podcast = input.required<PodcastDto>();

  currentIndex = computed(() => this.podcast().episodes!.findIndex(pe => pe.number == this.podcastEpisode().number));
  episodePrev = computed(() => this.podcast().episodes![this.currentIndex() - 1] ?? null);
  episodeNext = computed(() => this.podcast().episodes![this.currentIndex() + 1] ?? null);

  isOffline = computed(() => this.offlineService?.isPodcastEpisodeDownloaded(this.podcastEpisode().id!) ?? false);
  isOfflineLoading = computed(() => (this.offlineService?.isPodcastEpisodeDownloading(this.podcastEpisode().id!) || this.offlineService?.isPodcastEpisodeDeleting(this.podcastEpisode().id!)) ?? false);
  isInMyLibrary = computed(() => this.librariesService?.myLibrary()?.some(l => l.podcast?.id === this.podcast().id && l.podcastEpisode?.id === this.podcastEpisode().id));
  isMyLibraryLoading = computed(() => this.librariesService?.isLoading());
  isCurrentTrack = computed(() => this.audioPlayerService.isCurrentAudioSrc(this.podcastEpisode().audioUrl!));
  isCurrentTrackPlaying = computed(() => this.audioPlayerService.isCurrentPlayingAudioSrc(this.podcastEpisode().audioUrl!));
  isCurrentTrackLoading = computed(() => this.audioPlayerService.isCurrentLoadingAudioSrc(this.podcastEpisode().audioUrl!));

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
    const episodeTrack: AudioTrack = {
      title: this.podcastEpisode().name,
      subtitle: $localize`Ep. ${this.podcastEpisode().number} - ${this.podcast().name}`,
      artists: this.podcastEpisode().voicers?.map(v => v.nickname),
      audioSrc: this.podcastEpisode().audioUrl!,
      coverImageSrc: this.podcastEpisode().coverImagePreviewUrl,
      referenceLink: `/podcasts/${this.podcast().id}/episodes/${this.podcastEpisode().id}`
    };
    const episodeQueue = this.podcast().episodes!
      .map(pe => {
        const track: AudioTrack = {
          title: pe.name,
          subtitle: $localize`Ep. ${pe.number} - ${this.podcast().name}`,
          artists: pe.voicers?.map(v => v.nickname),
          audioSrc: pe.audioUrl!,
          coverImageSrc: pe.coverImagePreviewUrl,
          referenceLink: `/podcasts/${this.podcast().id}/episodes/${pe.id}`
        }
        return track
      });

    this.audioPlayerService.playTrack(episodeTrack, episodeQueue);
    this.toasterService.show($localize`"${this.podcast().name}" episodes added to queue`);
  }
  addToQueue() {
    const episodeTrack: AudioTrack = {
      title: this.podcastEpisode().name,
      subtitle: $localize`Ep. ${this.podcastEpisode().number} - ${this.podcast().name}`,
      artists: this.podcastEpisode().voicers?.map(v => v.nickname),
      audioSrc: this.podcastEpisode().audioUrl!,
      coverImageSrc: this.podcastEpisode().coverImagePreviewUrl,
      referenceLink: `/podcasts/${this.podcast().id}/episodes/${this.podcastEpisode().id}`
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
    const podcast = this.podcast();
    const podcastEpisode = this.podcastEpisode();
    const episodeLibrary: ManageLibraryDto = {
      podcastId: podcast.id,
      podcastEpisodeId: podcastEpisode.id
    };

    this.librariesService!.createMe(episodeLibrary).subscribe({
      next: () => {
        this.toasterService.show($localize`"${podcastEpisode.name}" added to My Library`);
      },
      error: (err) => {
        console.error('librariesService.createMe', episodeLibrary, err);
        this.toasterService.show($localize`"${podcastEpisode.name}" adding to My Library failed`, { type: 'error' });
      }
    });
  }
  removeFromMyLibrary() {
    const podcast = this.podcast();
    const podcastEpisode = this.podcastEpisode();
    const id: number = this.librariesService!.myLibrary()!
      .find(ml => ml.podcast?.id == podcast.id && ml.podcastEpisode?.id == podcastEpisode.id)!.id!;

    this.librariesService!.deleteMe(id).subscribe({
      next: () => {
        this.toasterService.show($localize`"${podcastEpisode.name}" removed from My Library`);
      },
      error: (err) => {
        console.error('librariesService.deleteMe', id, err);
        this.toasterService.show($localize`"${podcastEpisode.name}" removing from My Library failed`, { type: 'error' });
      }
    });
  }

  // offline
  toggleOffline() {
    if (this.isOffline()) this.removeOffline();
    else this.addOffline();
  }
  addOffline() {
    const podcastEpisode = this.podcastEpisode();

    this.dialogService.confirm(
      $localize`Download Podcast Episode`,
      $localize`Are you sure you want to download "${podcastEpisode.name}"? It will take some time depending on your internet connection.`)
      .subscribe((res) => {
        if (res) {
          this.toasterService.show($localize`"${podcastEpisode.name}" downloading...`);
          from(this.offlineService!.downloadPodcastEpisode(podcastEpisode)).subscribe({
            next: () => {
              this.toasterService.show($localize`"${podcastEpisode.name}" added to Offline`, { type: 'success' });
            },
            error: (err) => {
              console.error('offlineService.downloadPodcastEpisode', podcastEpisode, err);
              this.toasterService.show($localize`"${podcastEpisode.name}" adding to Offline failed`, { type: 'error' });
            }
          });
        }
      });
  }
  removeOffline() {
    const podcastEpisode = this.podcastEpisode();

    this.dialogService.confirm(
      $localize`Remove Podcast Episode`,
      $localize`Are you sure you want to remove "${podcastEpisode.name}" from Offline?`)
      .subscribe((res) => {
        if (res) {
          from(this.offlineService!.removePodcastEpisode(podcastEpisode.id!)).subscribe({
            next: () => {
              this.toasterService.show($localize`"${podcastEpisode.name}" removed from Offline`);
            },
            error: (err) => {
              console.error('offlineService.removePodcastEpisode', podcastEpisode.id!, err);
              this.toasterService.show($localize`"${podcastEpisode.name}" removing from Offline failed`, { type: 'error' });
            }
          });
        }
      });
  }
}
