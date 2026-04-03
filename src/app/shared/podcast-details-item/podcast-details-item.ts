import { Component, inject, input } from '@angular/core';
import { PodcastDto } from '../../core/models/dtos/podcast-dto.model';
import { RouterLink } from '@angular/router';
import { SecureMediaDirective } from '../../core/directives/secure-media.directive';
import { PodcastEpisodeItem } from "../podcast-episode-item/podcast-episode-item";
import { AudioTrack } from '../../core/models/audio-track.model';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { ToasterService } from '../../core/services/toaster.service';

@Component({
  selector: 'app-podcast-details-item',
  imports: [FontAwesomeModule, RouterLink, PodcastEpisodeItem, SecureMediaDirective],
  templateUrl: './podcast-details-item.html',
  styleUrl: './podcast-details-item.scss'
})
export class PodcastDetailsItem {
  private audioPlayerService = inject(AudioPlayerService);
  private toasterService = inject(ToasterService);

  faPlay = faPlay;

  podcast = input.required<PodcastDto>();

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
