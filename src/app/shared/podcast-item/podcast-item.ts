import { Component, input } from '@angular/core';
import { PodcastDto } from '../../core/models/dtos/podcast-dto.model';
import { RouterLink } from '@angular/router';
import { SecureMediaDirective } from '../../core/directives/secure-media.directive';

@Component({
  selector: 'app-podcast-item',
  imports: [RouterLink, SecureMediaDirective],
  templateUrl: './podcast-item.html',
  styleUrl: './podcast-item.scss'
})
export class PodcastItem {
  podcast = input.required<PodcastDto>();
}
