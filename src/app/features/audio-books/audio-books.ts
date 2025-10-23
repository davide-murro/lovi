
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AudioBooksPaged } from "../../shared/audio-books-paged/audio-books-paged";
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-audio-books',
  imports: [FontAwesomeModule, AudioBooksPaged],
  templateUrl: './audio-books.html',
  styleUrl: './audio-books.scss'
})
export class AudioBooks {
  private route = inject(ActivatedRoute);

  pageNumber = toSignal(this.route.queryParams.pipe(map(data => data['pageNumber'] ?? 1)));
  pageSize = toSignal(this.route.queryParams.pipe(map(data => data['pageSize'] ?? 10)));
  sortBy = toSignal(this.route.queryParams.pipe(map(data => data['sortBy'] ?? 'id')));
  sortOrder = toSignal(this.route.queryParams.pipe(map(data => data['sortOrder'] ?? 'asc')));
  search = toSignal(this.route.queryParams.pipe(map(data => data['search'] ?? '')));
}
