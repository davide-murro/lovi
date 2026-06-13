import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PodcastsPaged } from "../../shared/podcasts-paged/podcasts-paged";

@Component({
  selector: 'app-podcasts',
  imports: [FontAwesomeModule, PodcastsPaged],
  templateUrl: './podcasts.html',
  styleUrl: './podcasts.scss'
})
export class Podcasts {
  pageNumber = input(1, { transform: (v: number | undefined) => Number(v ?? 1) });
  pageSize = input(10, { transform: (v: number | undefined) => Number(v ?? 10) });
  sortBy = input('id', { transform: (v: string | undefined) => v ?? 'id' });
  sortOrder = input('asc', { transform: (v: 'asc' | 'desc' | undefined) => v ?? 'asc' });
  search = input('', { transform: (v: string | undefined) => v ?? '' });
}
