import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { faBookBookmark, faBookOpen, faCircleNotch, faDownload, faFileArrowDown, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AudioTrack } from '../../../core/models/audio-track.model';
import { ToasterService } from '../../../core/services/toaster.service';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { PodcastDto } from '../../../core/models/dtos/podcast-dto.model';
import { LibrariesService } from '../../../core/services/libraries.service';
import { ManageLibraryDto } from '../../../core/models/dtos/manage-library-dto.model';
import { AuthDirective } from '../../../core/directives/auth.directive';
import { PodcastEpisodeItem } from "../../../shared/podcast-episode-item/podcast-episode-item";
import { SecureMediaDirective } from '../../../core/directives/secure-media.directive';
import { DialogService } from '../../../core/services/dialog.service';
import { OfflineService } from '../../../core/services/offline.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-podcast-detail',
  imports: [FontAwesomeModule, RouterLink, AuthDirective, PodcastEpisodeItem, SecureMediaDirective],
  templateUrl: './podcast-details.html',
  styleUrl: './podcast-details.scss'
})
export class PodcastDetails {
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private audioPlayerService = inject(AudioPlayerService);
  private librariesService = inject(LibrariesService);
  private offlineService = inject(OfflineService);

  faPlay = faPlay;
  faPause = faPause;
  faBookOpen = faBookOpen;
  faBookBookmark = faBookBookmark;
  faCircleNotch = faCircleNotch;
  faFileArrowDown = faFileArrowDown;
  faDownload = faDownload;

  // podcast
  readonly podcast = input.required<PodcastDto>();

  isOffline = computed(() => this.offlineService?.isPodcastDownloaded(this.podcast().id!) ?? false);
  isOfflineLoading = computed(() => (this.offlineService?.isPodcastDownloading(this.podcast().id!) || this.offlineService?.isPodcastDeleting(this.podcast().id!)) ?? false);
  isInMyLibrary = computed(() => this.librariesService?.myLibrary()?.some(l => l.podcast?.id === this.podcast().id));
  isMyLibraryLoading = computed(() => this.librariesService?.isLoading());

  // audio player
  playAll() {
    const episodeQueue = this.podcast().episodes!
      .map(pe => {
        const number = pe.number;
        const episodeTrack: AudioTrack = {
          title: pe.name,
          subtitle: $localize`Episode ${number}`,
          artists: pe.voicers?.map(v => v.nickname),
          audioSrc: pe.audioUrl!,
          coverImageSrc: pe.coverImagePreviewUrl,
          referenceLink: `/podcasts/${this.podcast().id}/episodes/${pe.id}`
        }
        return episodeTrack
      });

    this.audioPlayerService.playTrack(episodeQueue[0], episodeQueue);
    this.toasterService.show($localize`"${this.podcast().name}" episodes added to queue`);
  }

  // library
  toggleMyLibrary() {
    if (this.isInMyLibrary()) this.removeFromMyLibrary();
    else this.addToMyLibrary();
  }
  addToMyLibrary() {
    const episodeLibraries: ManageLibraryDto[] = this.podcast().episodes!
      .map(pe => {
        const ml: ManageLibraryDto = {
          podcastId: this.podcast().id,
          podcastEpisodeId: pe.id
        }
        return ml;
      });

    this.librariesService!.createMeList(episodeLibraries).subscribe({
      next: () => {
        this.toasterService.show($localize`"${this.podcast().name}" added to My Library`);
      },
      error: (err) => {
        console.error('librariesService.createMeList', episodeLibraries, err);
        this.toasterService.show($localize`"${this.podcast().name}" adding to My Library failed`, { type: 'error' });
      }
    });
  }
  removeFromMyLibrary() {
    const ids: number[] = this.librariesService!.myLibrary()!
      .filter(pe => pe.podcast?.id == this.podcast().id)
      .map(pe => pe.id!);

    this.librariesService!.deleteMeList(ids).subscribe({
      next: () => {
        this.toasterService.show($localize`"${this.podcast().name}" removed from My Library`);
      },
      error: (err) => {
        console.error('librariesService.deleteMeList', ids, err);
        this.toasterService.show($localize`"${this.podcast().name}" removing from My Library failed`, { type: 'error' });
      }
    });
  }

  // offline
  toggleOffline() {
    if (this.isOffline()) this.removeOffline();
    else this.addOffline();
  }
  addOffline() {
    this.dialogService.confirm(
      $localize`Download Podcast`,
      $localize`Are you sure you want to download "${this.podcast().name}"? It will take a lot of space and time depending on your internet connection.`)
      .subscribe((res) => {
        if (res) {
          this.toasterService.show($localize`"${this.podcast().name}" downloading...`);
          from(this.offlineService!.downloadPodcast(this.podcast())).subscribe({
            next: () => {
              this.toasterService.show($localize`"${this.podcast().name}" added to offline`, { type: 'success' });
            },
            error: (err) => {
              console.error('offlineService.downloadPodcast', this.podcast().id!, err);
              this.toasterService.show($localize`"${this.podcast().name}" adding to offline failed`, { type: 'error' });
            }
          });
        }
      });
  }
  removeOffline() {
    this.dialogService.confirm(
      $localize`Remove Podcast`,
      $localize`Are you sure you want to remove "${this.podcast().name}" from offline? All the episodes will be removed.`)
      .subscribe((res) => {
        if (res) {
          from(this.offlineService!.removePodcast(this.podcast().id!)).subscribe({
            next: () => {
              this.toasterService.show($localize`"${this.podcast().name}" removed from offline`);
            },
            error: (err) => {
              console.error('offlineService.removePodcast', this.podcast().id!, err);
              this.toasterService.show($localize`"${this.podcast().name}" removing from offline failed`, { type: 'error' });
            }
          });
        }
      });
  }
}
