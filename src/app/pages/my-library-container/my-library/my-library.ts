import { Component, inject, signal, computed } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { of, catchError, finalize, defer } from "rxjs";
import { AudioTrack } from "../../../core/models/audio-track.model";
import { PodcastDto } from "../../../core/models/dtos/podcast-dto.model";
import { AudioPlayerService } from "../../../core/services/audio-player.service";
import { LibrariesService } from "../../../core/services/libraries.service";
import { ToasterService } from "../../../core/services/toaster.service";
import { AudioBookItem } from "../../../shared/audio-book-item/audio-book-item";
import { PodcastEpisodeItem } from "../../../shared/podcast-episode-item/podcast-episode-item";
import { SecureMediaDirective } from "../../../core/directives/secure-media.directive";


@Component({
  selector: 'app-my-library',
  imports: [FontAwesomeModule, RouterLink, AudioBookItem, PodcastEpisodeItem, SecureMediaDirective],
  templateUrl: './my-library.html',
  styleUrl: './my-library.scss'
})
export class MyLibrary {
  private toasterService = inject(ToasterService);
  private audioPlayerService = inject(AudioPlayerService);
  private librariesService = inject(LibrariesService);

  faPlay = faPlay;

  // Online Data Signal with Loading/Error
  myLibraryLoading = signal(false);
  myLibraryError = signal(false);
  myLibraryData = toSignal(defer(() => {
    this.myLibraryError.set(false);
    this.myLibraryLoading.set(true);

    return this.librariesService.getMe().pipe(
      catchError(err => {
        this.myLibraryError.set(true);
        console.error('librariesService.getMe', err);
        return of(null);
      }),
      finalize(() => this.myLibraryLoading.set(false))
    );
  }));

  // library  
  myLibraryAudioBooks = computed(() => {
    const list = this.myLibraryData()
      ?.filter((ml) => ml.audioBook?.id != null)
      .map(ml => ml.audioBook!);
    return list;
  });
  myLibraryPodcasts = computed(() => {
    const grouped = this.myLibraryData()
      ?.filter((ml) => ml.podcast?.id != null)
      .reduce((acc, ml) => {
        const pToFind = ml.podcast!;
        const pFound = acc.find(a => a.id === pToFind.id);
        if (pFound) pFound.episodes!.push(ml.podcastEpisode!);
        else acc.push({ ...pToFind, episodes: [ml.podcastEpisode!] })
        return acc;
      }, [] as PodcastDto[]);

    grouped?.forEach(p => p.episodes?.sort((a, b) => (a.number ?? 0) - (b.number ?? 0)));

    return grouped;
  });

  podcastPlayAll(podcast: PodcastDto) {
    const itemQueue = podcast!.episodes!
      .map(pe => {
        const number = pe.number;
        const track: AudioTrack = {
          title: pe.name,
          subtitle: $localize`Episode ${number}`,
          artists: pe.voicers?.map(v => v.nickname),
          audioSrc: pe.audioUrl!,
          coverImageSrc: pe.coverImagePreviewUrl,
          referenceLink: `/podcasts/${podcast.id}/episodes/${pe.id}`
        }
        return track!;
      });

    this.audioPlayerService.playTrack(itemQueue[0], itemQueue);
    this.toasterService.show($localize`"${podcast.name}" episodes added to queue`);
  }
}
