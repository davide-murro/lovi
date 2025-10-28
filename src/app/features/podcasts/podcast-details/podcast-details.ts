import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { faBookBookmark, faBookOpen, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AudioTrack } from '../../../core/models/audio-track.model';
import { ToasterService } from '../../../core/services/toaster.service';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { PodcastDto } from '../../../core/models/dtos/podcast-dto.model';
import { LibrariesService } from '../../../core/services/libraries.service';
import { ManageLibraryDto } from '../../../core/models/dtos/manage-library-dto.model';
import { AuthDirective } from '../../../core/directives/auth.directive';
import { PodcastEpisodeItem } from "../../../shared/podcast-episode-item/podcast-episode-item";

@Component({
  selector: 'app-podcast-detail',
  imports: [FontAwesomeModule, RouterLink, AuthDirective, PodcastEpisodeItem],
  templateUrl: './podcast-details.html',
  styleUrl: './podcast-details.scss'
})
export class PodcastDetails {
  private route = inject(ActivatedRoute);
  private toasterService = inject(ToasterService);
  private audioPlayerService = inject(AudioPlayerService);
  private librariesService = inject(LibrariesService);

  faPlay = faPlay;
  faPause = faPause;
  faBookOpen = faBookOpen;
  faBookBookmark = faBookBookmark;

  // podcast
  podcast: Signal<PodcastDto> = toSignal(this.route.data.pipe(map(data => data['podcast'])));
  
  isInMyLibrary = computed(() => this.librariesService.myLibrary()?.some(l => l.podcast?.id === this.podcast().id));

  // audio player
  playAll() {
    const episodeQueue = this.podcast().episodes!
      .map(pe => {
        const episodeTrack: AudioTrack = {
          id: null!,
          title: pe.name,
          subtitle: 'Episode ' + pe.number,
          audioSrc: pe.audioUrl!,
          coverImageSrc: pe.coverImageUrl,
          referenceLink: `/podcasts/${this.podcast().id}/episodes/${pe.id}`
        }
        return episodeTrack
      });

    this.audioPlayerService.playTrack(episodeQueue[0], episodeQueue);
    this.toasterService.show("Podcast added to queue");
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

    this.librariesService.createMeList(episodeLibraries).subscribe({
      next: () => {
        this.toasterService.show('Added all to My Library');
      },
      error: (err) => {
        console.error('librariesService.createMeList', episodeLibraries, err);
        this.toasterService.show('Adding all to My Library failed', { type: 'error' });
      }
    });
  }
  removeFromMyLibrary() {
    const ids: number[] = this.librariesService.myLibrary()!
      .filter(pe => pe.podcast?.id == this.podcast().id)
      .map(pe => pe.id!);

    this.librariesService.deleteMeList(ids).subscribe({
      next: () => {
        this.toasterService.show('Removed all from My Library');
      },
      error: (err) => {
        console.error('librariesService.deleteMeList', ids, err);
        this.toasterService.show('Removing all from My Library failed', { type: 'error' });
      }
    });
  }
}
