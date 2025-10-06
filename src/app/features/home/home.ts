import { Component, inject } from '@angular/core';
import { PodcastsService } from '../../core/services/podcasts.service';
import { ToasterService } from '../../core/services/toaster.service';
import { AuthDirective } from "../../core/directives/auth.directive";

@Component({
  selector: 'app-home',
  imports: [AuthDirective],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private toasterService = inject(ToasterService);
  private podcastsService = inject(PodcastsService);

  call(): void {
    this.podcastsService.getAll().subscribe({
      next: (p) => console.log('Get podcasts successful!', p),
      error: (err) => console.error('Get podcasts failed', err)
    });
  }
  toast() {
    this.toasterService.show('try toast!', { type: 'success' });
    this.toasterService.show('try toast molto lungo per vedere fino a dove arriva e se va a capo !');
  }
}
