
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AudioBooksPaged } from "../../shared/audio-books-paged/audio-books-paged";
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-audio-books',
  imports: [FontAwesomeModule, AudioBooksPaged],
  templateUrl: './audio-books.html',
  styleUrl: './audio-books.scss'
})
export class AudioBooks {
  pageNumber = input(1, { transform: (v: number | undefined) => Number(v ?? 1) });
  pageSize = input(10, { transform: (v: number | undefined) => Number(v ?? 10) });
  sortBy = input('id', { transform: (v: string | undefined) => v ?? 'id' });
  sortOrder = input('asc', { transform: (v: 'asc' | 'desc' | undefined) => v ?? 'asc' });
  search = input('', { transform: (v: string | undefined) => v ?? '' });
}
