import { Component, inject, computed } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { AudioTrack } from "../../../core/models/audio-track.model";
import { PodcastDto } from "../../../core/models/dtos/podcast-dto.model";
import { AudioPlayerService } from "../../../core/services/audio-player.service";
import { OfflineService } from "../../../core/services/offline.service";
import { ToasterService } from "../../../core/services/toaster.service";
import { AudioBookItem } from "../../../shared/audio-book-item/audio-book-item";
import { PodcastEpisodeItem } from "../../../shared/podcast-episode-item/podcast-episode-item";
import { OfflineUrlPipe } from "../../../core/pipes/offline-url.pipe";

@Component({
  selector: 'app-my-offline',
  imports: [FontAwesomeModule, RouterLink, AudioBookItem, PodcastEpisodeItem, OfflineUrlPipe],
  templateUrl: './my-offline.html',
  styleUrl: './my-offline.scss'
})
export class MyOffline {
  private toasterService = inject(ToasterService);
  private audioPlayerService = inject(AudioPlayerService);
  private offlineService = inject(OfflineService);

  faPlay = faPlay;

  // offline
  myOfflineAudioBooks = computed(() => {
    return this.offlineService.audioBooks();
  });
  myOfflinePodcasts = computed(() => {
    const grouped = this.offlineService.podcasts();
    grouped.forEach(p => p.episodes?.sort((a, b) => (a.number ?? 0) - (b.number ?? 0)));

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
