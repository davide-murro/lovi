import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { OfflineService } from "../services/offline.service";
import { FetchInterceptorFn } from "./fetch-client/fetch-interceptor.type";


export const offlineFetchInterceptor: FetchInterceptorFn = async (url, init, next) => {
  const authService = inject(AuthService);
  if (!authService.isLoggedIn()) {
    return next(url, init);
  }

  const offlineService = inject(OfflineService);

  let isOffline = false;

  // Audiobooks
  const audioBookMatch = url.match(/\/api\/audio-books\/(\d+)/);
  if (audioBookMatch) {
    const id = parseInt(audioBookMatch[1]);
    isOffline = offlineService.isAudioBookDownloaded(id) || offlineService.isAudioBookDownloading(id);
  }

  // Podcasts & Episodes
  const podcastMatch = url.match(/\/api\/podcasts\/(\d+)/);
  if (podcastMatch) {
    const podcastId = parseInt(podcastMatch[1]);
    const episodeMatch = url.match(/\/episodes\/(\d+)/);
    if (episodeMatch) {
      const episodeId = parseInt(episodeMatch[1]);
      isOffline = offlineService.isPodcastEpisodeDownloaded(episodeId) || offlineService.isPodcastEpisodeDownloading(episodeId);
    } else {
      isOffline = offlineService.isPodcastDownloaded(podcastId) || offlineService.isPodcastDownloading(podcastId);
    }
  }

  // Creators
  const creatorMatch = url.match(/\/api\/creators\/(\d+)/);
  if (creatorMatch) {
    const id = parseInt(creatorMatch[1]);
    isOffline = offlineService.isCreatorDownloaded(id) || offlineService.isCreatorDownloading(id);
  }

  // Add isOffline=True to the request if offline
  const finalUrl = new URL(url, window.location.origin);
  if (isOffline) {
    finalUrl.searchParams.set('isOffline', 'True');
  }

  return next(finalUrl.toString(), init);
}
