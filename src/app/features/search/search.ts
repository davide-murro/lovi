import { Component, effect, input } from '@angular/core';
import { PodcastsPaged } from "../../shared/podcasts-paged/podcasts-paged";
import { AudioBooksPaged } from "../../shared/audio-books-paged/audio-books-paged";

@Component({
  selector: 'app-search',
  imports: [PodcastsPaged, AudioBooksPaged],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  search = input('', { transform: (v: string | undefined) => v ?? '' });
}
