import { Component, inject, OnInit } from '@angular/core';
import { PodcastsService } from '../../core/services/podcasts.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private podcastsService = inject(PodcastsService);

  ngOnInit(): void {
  }
  call(): void {
    this.podcastsService.getAll().subscribe({
      next: (p) => console.log('Get podcasts successful!', p),
      error: (err) => console.error('Get podcasts failed', err)
    });
  }
}
