import { Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AudioPlayerService } from '../../../../core/services/audio-player.service';
import { AudioTrack } from '../../../../core/models/audio-track.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faBookBookmark, faBookOpen, faForward, faList, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { ToasterService } from '../../../../core/services/toaster.service';
import { PodcastEpisodeDto } from '../../../../core/models/dtos/podcast-episode-dto.model';
import { LibrariesService } from '../../../../core/services/libraries.service';
import { ManageLibraryDto } from '../../../../core/models/dtos/manage-library-dto.model';
import { AuthDirective } from '../../../../core/directives/auth.directive';

@Component({
  selector: 'app-podcast-episode',
  imports: [FontAwesomeModule, RouterLink, AuthDirective],
  templateUrl: './podcast-episode.html',
  styleUrl: './podcast-episode.scss'
})
export class PodcastEpisode {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toasterService = inject(ToasterService);
  private audioPlayerService = inject(AudioPlayerService);
  private librariesService = inject(LibrariesService);

  faPlay = faPlay;
  faPause = faPause;
  faList = faList;
  faBackward = faBackward;
  faForward = faForward;
  faBookOpen = faBookOpen;
  faBookBookmark = faBookBookmark;

  // episode
  episode: Signal<PodcastEpisodeDto> = toSignal(this.route.data.pipe(map(data => data['podcastEpisode'])));

  episodePrev = computed(() => this.episode().podcast!.episodes!.find(pe => pe.number == this.episode().number - 1));
  episodeNext = computed(() => this.episode().podcast!.episodes!.find(pe => pe.number == this.episode().number + 1));

  isInMyLibrary = computed(() => this.librariesService.myLibrary()?.some(l => l.podcast?.id === this.episode().podcast!.id && l.podcastEpisode?.id === this.episode().id));
  isCurrentTrack = computed(() => this.audioPlayerService.isCurrentAudioSrc(this.episode().audioUrl!));
  isCurrentTrackPlaying = computed(() => this.audioPlayerService.isCurrentPlayingAudioSrc(this.episode().audioUrl!));

  // episode
  prevEpisode() {
    this.router.navigate(['/podcasts', this.episode().podcast!.id, 'episodes', this.episodePrev()!.id]);
  }
  nextEpisode() {
    this.router.navigate(['/podcasts', this.episode().podcast!.id, 'episodes', this.episodeNext()!.id]);
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
    const episodeTrack: AudioTrack = {
      id: null!,
      title: this.episode().name,
      subtitle: 'Episode ' + this.episode().number,
      audioSrc: this.episode().audioUrl!,
      coverImageSrc: this.episode().coverImagePreviewUrl,
      referenceLink: `/podcasts/${this.episode().podcast!.id}/episodes/${this.episode().id}`
    };
    const episodeQueue = this.episode().podcast!.episodes!
      .map(pe => {
        const track: AudioTrack = {
          id: null!,
          title: pe.name,
          subtitle: 'Episode ' + pe.number,
          audioSrc: pe.audioUrl!,
          coverImageSrc: pe.coverImagePreviewUrl,
          referenceLink: `/podcasts/${this.episode().podcast!.id}/episodes/${pe.id}`
        }
        return track
      });

    this.audioPlayerService.playTrack(episodeTrack, episodeQueue);
    this.toasterService.show("Podcast added to queue");
  }
  addToQueue() {
    const episodeTrack: AudioTrack = {
      id: null!,
      title: this.episode().name,
      subtitle: 'Episode ' + this.episode().number,
      audioSrc: this.episode().audioUrl!,
      coverImageSrc: this.episode().coverImagePreviewUrl,
      referenceLink: `/podcasts/${this.episode().podcast!.id}/episodes/${this.episode().id}`
    }
    this.audioPlayerService.addToQueue(episodeTrack);
    this.toasterService.show("Episode added to queue");
  }

  // libraries
  toggleMyLibrary() {
    if (this.isInMyLibrary()) this.removeFromMyLibrary();
    else this.addToMyLibrary();
  }
  addToMyLibrary() {
    const episodeLibrary: ManageLibraryDto = {
      podcastId: this.episode().podcast!.id,
      podcastEpisodeId: this.episode().id
    };

    this.librariesService.createMe(episodeLibrary).subscribe({
      next: () => {
        this.toasterService.show('Added to My Library');
      },
      error: (err) => {
        console.error('librariesService.createMe', episodeLibrary, err);
        this.toasterService.show('Adding to My Library failed', { type: 'error' });
      }
    });
  }
  removeFromMyLibrary() {
    const id: number = this.librariesService.myLibrary()!
      .find(ml => ml.podcast?.id == this.episode().podcast!.id && ml.podcastEpisode?.id == this.episode().id)!.id!;

    this.librariesService.deleteMe(id).subscribe({
      next: () => {
        this.toasterService.show('Removed from My Library');
      },
      error: (err) => {
        console.error('librariesService.deleteMe', id, err);
        this.toasterService.show('Removing from My Library failed', { type: 'error' });
      }
    });
  }
}
