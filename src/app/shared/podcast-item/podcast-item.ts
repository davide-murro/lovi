import { Component, input } from '@angular/core';
import { PodcastDto } from '../../core/models/dtos/podcast-dto.model';
import { RouterLink } from '@angular/router';
import { OfflineUrlPipe } from '../../core/pipes/offline-url.pipe';

@Component({
  selector: 'app-podcast-item',
  imports: [RouterLink, OfflineUrlPipe],
  templateUrl: './podcast-item.html',
  styleUrl: './podcast-item.scss'
})
export class PodcastItem {
  podcast = input.required<PodcastDto>();
}
