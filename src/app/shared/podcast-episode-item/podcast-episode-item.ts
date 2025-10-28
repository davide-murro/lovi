import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PodcastEpisodeDto } from '../../core/models/dtos/podcast-episode-dto.model';
import { PodcastDto } from '../../core/models/dtos/podcast-dto.model';

@Component({
  selector: 'app-podcast-episode-item',
  imports: [RouterLink],
  templateUrl: './podcast-episode-item.html',
  styleUrl: './podcast-episode-item.scss'
})
export class PodcastEpisodeItem {
  podcast = input<PodcastDto>(null!);
  episode = input<PodcastEpisodeDto>(null!);
}
