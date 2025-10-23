import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PodcastsPaged } from "../../shared/podcasts-paged/podcasts-paged";

@Component({
  selector: 'app-podcasts',
  imports: [FontAwesomeModule, PodcastsPaged],
  templateUrl: './podcasts.html',
  styleUrl: './podcasts.scss'
})
export class Podcasts {
  private route = inject(ActivatedRoute);

  pageNumber = toSignal(this.route.queryParams.pipe(map(data => data['pageNumber'] ?? 1)));
  pageSize = toSignal(this.route.queryParams.pipe(map(data => data['pageSize'] ?? 10)));
  sortBy = toSignal(this.route.queryParams.pipe(map(data => data['sortBy'] ?? 'id')));
  sortOrder = toSignal(this.route.queryParams.pipe(map(data => data['sortOrder'] ?? 'asc')));
  search = toSignal(this.route.queryParams.pipe(map(data => data['search'] ?? '')));
}
