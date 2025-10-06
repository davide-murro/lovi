import { Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AudioPlayerService } from '../../../../core/services/audio-player.service';
import { AudioTrack } from '../../../../core/models/audio-track.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faForward, faList, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
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

  private _episode: Signal<PodcastEpisodeDto> = toSignal(this.route.data.pipe(map(data => data['podcastEpisode'])));

  faPlay = faPlay;
  faPause = faPause;
  faList = faList;
  faBackward = faBackward;
  faForward = faForward;

  // episode
  episode = computed(() => {
    const ep: PodcastEpisodeDto =
    {
      ...this._episode(),
      isInMyLibrary: this.librariesService.myLibrary()?.some(l => l.podcast?.id === this._episode().podcast.id && l.podcastEpisode?.id === this._episode().id),
      isCurrentTrack: this.audioPlayerService.isCurrentAudioSrc(this._episode().audioUrl),
      isCurrentTrackPlaying: this.audioPlayerService.isCurrentPlayingAudioSrc(this._episode().audioUrl)
    }
    return ep;
  });

  episodePrev = computed(() => this._episode().podcast.episodes.find(pe => pe.number == this._episode().number - 1));
  episodeNext = computed(() => this._episode().podcast.episodes.find(pe => pe.number == this._episode().number + 1));

  // episode
  prevEpisode() {
    this.router.navigate(['/podcasts', this._episode().podcast.id, 'episodes', this.episodePrev()!.id]);
  }
  nextEpisode() {
    this.router.navigate(['/podcasts', this._episode().podcast.id, 'episodes', this.episodeNext()!.id]);
  }

  // audio player
  togglePlay() {
    if (this.episode().isCurrentTrackPlaying) this.pause();
    else if (this.episode().isCurrentTrack) this.play();
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
      title: this._episode().name,
      //subtitle: this.podcastEpisode().name,
      audioSrc: this._episode().audioUrl,
      coverImageSrc: this._episode().coverImageUrl,
      referenceLink: `/podcasts/${this._episode().podcast.id}/episodes/${this._episode().id}`
    }
    const episodeQueue = this._episode().podcast.episodes
      .map(pe => {
        const episodeTrack: AudioTrack = {
          id: null!,
          title: pe.name,
          //subtitle: pe.name,
          audioSrc: pe.audioUrl,
          coverImageSrc: pe.coverImageUrl,
          referenceLink: `/podcasts/${this._episode().podcast.id}/episodes/${pe.id}`
        }
        return episodeTrack
      });

    this.audioPlayerService.playTrack(episodeTrack, episodeQueue);
    this.toasterService.show("Album added to queue");
  }
  addToQueue() {
    const episodeTrack: AudioTrack = {
      id: null!,
      title: this._episode().name,
      //subtitle: this.podcastEpisode().name,
      audioSrc: this._episode().audioUrl,
      coverImageSrc: this._episode().coverImageUrl,
      referenceLink: `/podcasts/${this._episode().podcast.id}/episodes/${this._episode().id}`
    }
    this.audioPlayerService.addToQueue(episodeTrack);
    this.toasterService.show("Track added to queue");
  }

  // libraries
  toggleMyLibrary() {
    if (this.episode().isInMyLibrary) this.removeFromMyLibrary();
    else this.addToMyLibrary();
  }
  addToMyLibrary() {
    const episodeLibrary: ManageLibraryDto = {
      podcastId: this._episode().podcast.id,
      podcastEpisodeId: this._episode().id
    };

    this.librariesService.createMe(episodeLibrary).subscribe({
      next: () => {
        this.toasterService.show('Added to My Library');
      },
      error: (err) => console.error('Adding to My Library failed', err)
    });
  }
  removeFromMyLibrary() {
    const id: number = this.librariesService.myLibrary()!
      .find(pe => pe.podcast?.id == this._episode().podcast.id && pe.podcastEpisode?.id == this._episode().id)!.id;

    this.librariesService.deleteMe(id).subscribe({
      next: () => {
        this.toasterService.show('Deleted from My Library');
      },
      error: (err) => console.error('Deleting from My Library failed', err)
    });
  }
}
