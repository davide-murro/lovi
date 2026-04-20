import { Component, input } from '@angular/core';
import { PodcastsPaged } from "../../shared/podcasts-paged/podcasts-paged";
import { AudioBooksPaged } from "../../shared/audio-books-paged/audio-books-paged";
import { EBooksPaged } from "../../shared/e-books-paged/e-books-paged";

@Component({
  selector: 'app-search',
  imports: [PodcastsPaged, AudioBooksPaged, EBooksPaged],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  search = input('', { transform: (v: string | undefined) => v ?? '' });
}
