import { Component, computed, inject, Signal } from '@angular/core';
import { LibraryDto } from '../../core/models/dtos/library-dto.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PodcastDto } from '../../core/models/dtos/podcast-dto.model';
import { faPause, faPlay, faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PodcastEpisodeDto } from '../../core/models/dtos/podcast-episode-dto.model';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { AudioTrack } from '../../core/models/audio-track.model';
import { AudioBookDto } from '../../core/models/dtos/audio-book-dto.model';

@Component({
  selector: 'app-my-library',
  imports: [FontAwesomeModule, RouterLink],
  templateUrl: './my-library.html',
  styleUrl: './my-library.scss'
})
export class MyLibrary {
  private route = inject(ActivatedRoute);
  private audioPlayerService = inject(AudioPlayerService);

  faPlay = faPlay;
  faPause = faPause;

  private _myLibrary: Signal<LibraryDto[]> = toSignal(this.route.data.pipe(map(data => data['myLibrary'])));

  // library
  myLibraryPodcasts = computed(() => {
    const grouped = this._myLibrary()
      .filter((ml) => ml.podcast?.id != null)
      .reduce((acc, ml) => {
        const pToFind = ml.podcast!;
        const pFound = acc.find(a => a.id === ml.podcast!.id)!;
        const peToInsert: PodcastEpisodeDto = {
          ...ml.podcastEpisode!,
          isCurrentTrack: this.audioPlayerService.isCurrentAudioSrc(ml.podcastEpisode!.audioUrl),
          isCurrentTrackPlaying: this.audioPlayerService.isCurrentPlayingAudioSrc(ml.podcastEpisode!.audioUrl)
        };
        if (pFound) pFound.episodes.push(peToInsert);
        else acc.push({ ...pToFind, episodes: [peToInsert] })
        return acc;
      }, [] as PodcastDto[]);

    return grouped;
  });
  myLibraryAudioBooks = computed(() => {
    const list = this._myLibrary()
      .filter((ml) => ml.audioBook?.id != null)
      .map(ml => {
        const audioBook: AudioBookDto = {
          ...ml.podcastEpisode!,
          isCurrentTrack: this.audioPlayerService.isCurrentAudioSrc(ml.podcastEpisode!.audioUrl),
          isCurrentTrackPlaying: this.audioPlayerService.isCurrentPlayingAudioSrc(ml.podcastEpisode!.audioUrl)
        }
        return audioBook;
      });
    return list;
  });


  // audio player
  togglePlay(episode: PodcastEpisodeDto) {
    if (episode.isCurrentTrackPlaying) this.pause(episode);
    else if (episode.isCurrentTrack) this.play(episode);
    else this.playAll(episode);
  }
  play(episode: PodcastEpisodeDto) {
    this.audioPlayerService.play();
  }
  pause(episode: PodcastEpisodeDto) {
    this.audioPlayerService.pause();
  }
  playAll(episode: PodcastEpisodeDto) {
    /*
    const episodeTrack: AudioTrack = {
      id: null!,
      title: episode.name,
      //subtitle: episode.name,
      audioSrc: episode.audioUrl,
      coverImageSrc: episode.coverImageUrl,
      referenceLink: `/podcasts/${episode.podcast.id}/episodes/${episode.id}`
    }
    const episodeQueue = episode.podcast.episodes
      .map(pe => {
        const episodeTrack: AudioTrack = {
          id: null!,
          title: pe.name,
          //subtitle: pe.name,
          audioSrc: pe.audioUrl,
          coverImageSrc: pe.coverImageUrl,
          referenceLink: `/podcasts/${episode.podcast.id}/episodes/${pe.id}`
        }
        return episodeTrack
      });

    this.audioPlayerService.playTrack(episodeTrack, episodeQueue);
    //this.toasterService.show("Album added to queue");
    */
  }
}
