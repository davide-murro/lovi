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
import { ToasterService } from '../../core/services/toaster.service';

@Component({
  selector: 'app-my-library',
  imports: [FontAwesomeModule, RouterLink],
  templateUrl: './my-library.html',
  styleUrl: './my-library.scss'
})
export class MyLibrary {
  private route = inject(ActivatedRoute);
  private audioPlayerService = inject(AudioPlayerService);
  private toasterService = inject(ToasterService);

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
          ...ml.audioBook!,
          isCurrentTrack: this.audioPlayerService.isCurrentAudioSrc(ml.audioBook!.audioUrl),
          isCurrentTrackPlaying: this.audioPlayerService.isCurrentPlayingAudioSrc(ml.audioBook!.audioUrl)
        }
        return audioBook;
      });
    return list;
  });


  // audio player
  togglePlay(item: PodcastEpisodeDto | AudioBookDto) {
    if (item.isCurrentTrackPlaying) this.pause();
    else if (item.isCurrentTrack) this.play();
    else this.playAll(item);
  }
  play() {
    this.audioPlayerService.play();
  }
  pause() {
    this.audioPlayerService.pause();
  }
  playAll(item: PodcastEpisodeDto | AudioBookDto) {
    let itemTrack: AudioTrack;

    const itemQueue = this._myLibrary()
      .map(ml => {
        let track: AudioTrack;

        if (ml.podcast?.id != null && ml.podcastEpisode != null) {
          track = {
            id: null!,
            title: ml.podcastEpisode.name,
            //subtitle: pe.name,
            audioSrc: ml.podcastEpisode.audioUrl,
            coverImageSrc: ml.podcastEpisode.coverImageUrl,
            referenceLink: `/podcasts/${ml.podcast.id}/episodes/${ml.id}`
          }
          if (ml.podcast.id === item.id) itemTrack = track;
        } else if (ml.audioBook?.id != null) {
          track = {
            id: null!,
            title: ml.audioBook.name,
            //subtitle: pe.name,
            audioSrc: ml.audioBook.audioUrl,
            coverImageSrc: ml.audioBook.coverImageUrl,
            referenceLink: `/audio-books/${ml.audioBook.id}`
          }
          if (ml.audioBook.id === item.id) itemTrack = track;
        }

        return track!;
      });

    this.audioPlayerService.playTrack(itemTrack!, itemQueue);
    this.toasterService.show("Album added to queue");
  }
}
