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

  // library
  private _myLibrary: Signal<LibraryDto[]> = toSignal(this.route.data.pipe(map(data => data['myLibrary'])));
  myLibraryError = computed(() => this._myLibrary() == null);
  myLibraryAudioBooks = computed(() => {
    const list = this._myLibrary()
      .filter((ml) => ml.audioBook?.id != null)
      .map(ml => {
        const audioBook: AudioBookDto = {
          ...ml.audioBook!,
          isCurrentTrack: this.audioPlayerService.isCurrentAudioSrc(ml.audioBook!.audioUrl!),
          isCurrentTrackPlaying: this.audioPlayerService.isCurrentPlayingAudioSrc(ml.audioBook!.audioUrl!)
        }
        return audioBook;
      });
    return list;
  });
  myLibraryPodcasts = computed(() => {
    const grouped = this._myLibrary()
      .filter((ml) => ml.podcast?.id != null)
      .reduce((acc, ml) => {
        const pToFind = ml.podcast!;
        const pFound = acc.find(a => a.id === ml.podcast!.id)!;
        const peToInsert: PodcastEpisodeDto = {
          ...ml.podcastEpisode!,
          isCurrentTrack: this.audioPlayerService.isCurrentAudioSrc(ml.podcastEpisode!.audioUrl!),
          isCurrentTrackPlaying: this.audioPlayerService.isCurrentPlayingAudioSrc(ml.podcastEpisode!.audioUrl!)
        };
        if (pFound) pFound.episodes!.push(peToInsert);
        else acc.push({ ...pToFind, episodes: [peToInsert] })
        return acc;
      }, [] as PodcastDto[]);

    return grouped;
  });


  // audio player
  play() {
    this.audioPlayerService.play();
  }
  pause() {
    this.audioPlayerService.pause();
  }
  audioBookTogglePlay(audioBook: AudioBookDto) {
    if (audioBook.isCurrentTrackPlaying) this.pause();
    else if (audioBook.isCurrentTrack) this.play();
    else this.audioBookPlayAll(audioBook);
  }
  audioBookPlayAll(audioBook: AudioBookDto) {
    const itemTrack: AudioTrack = {
      id: null!,
      title: audioBook.name,
      subtitle: audioBook.readers?.map(r => r.nickname).join(", "),
      audioSrc: audioBook.audioUrl!,
      coverImageSrc: audioBook.coverImageUrl,
      referenceLink: `/audio-books/${audioBook.id}`
    };

    this.audioPlayerService.playTrack(itemTrack);
  }
  podcastEpisodeTogglePlay(podcast: PodcastDto, podcastEpisode: PodcastEpisodeDto) {
    if (podcastEpisode.isCurrentTrackPlaying) this.pause();
    else if (podcastEpisode.isCurrentTrack) this.play();
    else this.podcastEpisodePlayAll(podcast, podcastEpisode);
  }
  podcastEpisodePlayAll(podcast: PodcastDto, podcastEpisode: PodcastEpisodeDto) {
    const itemTrack: AudioTrack = {
      id: null!,
      title: podcastEpisode.name,
      subtitle: 'Episode ' + podcastEpisode.number,
      audioSrc: podcastEpisode.audioUrl!,
      coverImageSrc: podcastEpisode.coverImageUrl,
      referenceLink: `/podcasts/${podcast.id}/episodes/${podcastEpisode.id}`
    };

    const itemQueue = this.myLibraryPodcasts()
      .find(p => p.id === podcast.id)!.episodes!
      .map(pe => {
        const track: AudioTrack = {
          id: null!,
          title: pe.name,
          subtitle: 'Episode ' + pe.number,
          audioSrc: pe.audioUrl!,
          coverImageSrc: pe.coverImageUrl,
          referenceLink: `/podcasts/${podcast.id}/episodes/${pe.id}`
        }
        return track!;
      });

    this.audioPlayerService.playTrack(itemTrack, itemQueue);
    this.toasterService.show("Podcast added to queue");
  }
}
