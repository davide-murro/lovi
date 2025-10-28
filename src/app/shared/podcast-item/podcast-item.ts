import { Component, input } from '@angular/core';
import { PodcastDto } from '../../core/models/dtos/podcast-dto.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-podcast-item',
  imports: [RouterLink],
  templateUrl: './podcast-item.html',
  styleUrl: './podcast-item.scss'
})
export class PodcastItem {
  podcast = input<PodcastDto>(null!);
}
