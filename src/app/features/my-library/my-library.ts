import { Component, computed, inject, Signal } from '@angular/core';
import { LibraryDto } from '../../core/models/dtos/library-dto.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PodcastDto } from '../../core/models/dtos/podcast-dto.model';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { AudioTrack } from '../../core/models/audio-track.model';
import { ToasterService } from '../../core/services/toaster.service';
import { AudioBookItem } from "../../shared/audio-book-item/audio-book-item";
import { PodcastEpisodeItem } from "../../shared/podcast-episode-item/podcast-episode-item";

@Component({
  selector: 'app-my-library',
  imports: [FontAwesomeModule, RouterLink, AudioBookItem, PodcastEpisodeItem],
  templateUrl: './my-library.html',
  styleUrl: './my-library.scss'
})
export class MyLibrary {
  private route = inject(ActivatedRoute);
  private toasterService = inject(ToasterService);
  private audioPlayerService = inject(AudioPlayerService);

  faPlay = faPlay;
  
  // library
  private _myLibrary: Signal<LibraryDto[]> = toSignal(this.route.data.pipe(map(data => data['myLibrary'])));
  
  myLibraryAudioBooks = computed(() => {
    const list = this._myLibrary()
      .filter((ml) => ml.audioBook?.id != null)
      .map(ml => ml.audioBook!);
    return list;
  });
  myLibraryPodcasts = computed(() => {
    const grouped = this._myLibrary()
      .filter((ml) => ml.podcast?.id != null)
      .reduce((acc, ml) => {
        const pToFind = ml.podcast!;
        const pFound = acc.find(a => a.id === ml.podcast!.id)!;
        if (pFound) pFound.episodes!.push(ml.podcastEpisode!);
        else acc.push({ ...pToFind, episodes: [ml.podcastEpisode!] })
        return acc;
      }, [] as PodcastDto[]);

    return grouped;
  });
  
  podcastPlayAll(podcast: PodcastDto) {
    const itemQueue = this.myLibraryPodcasts()
      .find(p => p.id === podcast.id)!.episodes!
      .map(pe => {
        const track: AudioTrack = {
          id: null!,
          title: pe.name,
          subtitle: 'Episode ' + pe.number,
          audioSrc: pe.audioUrl!,
          coverImageSrc: pe.coverImagePreviewUrl,
          referenceLink: `/podcasts/${podcast.id}/episodes/${pe.id}`
        }
        return track!;
      });

    this.audioPlayerService.playTrack(itemQueue[0], itemQueue);
    this.toasterService.show("Podcast added to queue");
  }
}
