import { Component, inject } from '@angular/core';
import { PodcastsService } from '../../core/services/podcasts.service';
import { ToasterService } from '../../core/services/toaster.service';
import { DialogService } from '../../core/services/dialog.service';
import { Podcasts } from "../podcasts/podcasts";
import { AudioBooks } from "../audio-books/audio-books";

@Component({
  selector: 'app-home',
  imports: [Podcasts, AudioBooks],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
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
  dialog() {
    this.dialogService.log('Test', 'try toast molto lungo per vedere fino a dove arriva e se va a capo !');
  }
}
