import { Component, inject, computed } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { OfflineService } from "../../../core/services/offline.service";
import { AudioBookItem } from "../../../shared/audio-book-item/audio-book-item";
import { PodcastDetailsItem } from "../../../shared/podcast-details-item/podcast-details-item";
import { EBookItem } from "../../../shared/e-book-item/e-book-item";

@Component({
  selector: 'app-my-offline',
  imports: [FontAwesomeModule, AudioBookItem, PodcastDetailsItem, EBookItem],
  templateUrl: './my-offline.html',
  styleUrl: './my-offline.scss'
})
export class MyOffline {
  private offlineService = inject(OfflineService);

  // offline
  myOfflineAudioBooks = computed(() => {
    return this.offlineService.audioBooks();
  });
  myOfflineEBooks = computed(() => {
    return this.offlineService.eBooks();
  });
  myOfflinePodcasts = computed(() => {
    const grouped = this.offlineService.podcasts();
    grouped.forEach(p => p.episodes?.sort((a, b) => (a.number ?? 0) - (b.number ?? 0)));

    return grouped;
  });
}
