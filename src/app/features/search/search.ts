import { Component, inject } from '@angular/core';
import { AudioBooks } from '../audio-books/audio-books';
import { Podcasts } from '../podcasts/podcasts';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { PodcastsPaged } from "../../shared/podcasts-paged/podcasts-paged";
import { AudioBooksPaged } from "../../shared/audio-books-paged/audio-books-paged";

@Component({
  selector: 'app-search',
  imports: [PodcastsPaged, AudioBooksPaged],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  private route = inject(ActivatedRoute);
  
  search = toSignal(this.route.queryParams.pipe(map(data => data['search'] ?? '')));
}
