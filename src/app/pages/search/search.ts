import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { PodcastsPaged } from "../../shared/podcasts-paged/podcasts-paged";
import { BooksPaged } from "../../shared/books-paged/books-paged";

@Component({
  selector: 'app-search',
  imports: [PodcastsPaged, BooksPaged],
  templateUrl: './search.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './search.scss'
})
export class Search {
  search = input('', { transform: (v: string | undefined) => v ?? '' });
}
