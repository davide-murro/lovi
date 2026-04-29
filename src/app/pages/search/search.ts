import { Component, input } from '@angular/core';
import { PodcastsPaged } from "../../shared/podcasts-paged/podcasts-paged";
import { BooksPaged } from "../../shared/books-paged/books-paged";

@Component({
  selector: 'app-search',
  imports: [PodcastsPaged, BooksPaged],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  search = input('', { transform: (v: string | undefined) => v ?? '' });
}
